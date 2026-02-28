import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {
  private http = inject(HttpClient);
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  // Audio Context for Silence Detection
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStreamAudioSourceNode | null = null;
  private silenceTimer: any = null;
  private animationFrameId: number | null = null;
  
  // State Signals
  isRecording = signal(false);
  isProcessing = signal(false);
  transcribedText = signal('');
  uploadError = signal<string | null>(null);
  
  // For exponential backoff
  private maxRetries = 3;
  private retryDelayMs = 2000;

  async startRecording() {
    this.uploadError.set(null);
    this.transcribedText.set('');
    this.audioChunks = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.processAudio();
        this.cleanupAudioContext();
        stream.getTracks().forEach(track => track.stop());
      };
      
      this.mediaRecorder.start();
      this.isRecording.set(true);
      
      // Initialize Silence Detection
      this.setupSilenceDetection(stream);
      
    } catch (error) {
      console.error('Microphone access denied or not supported', error);
      this.uploadError.set('لم نتمكن من الوصول للميكروفون. يرجى التأكد من الصلاحيات.');
    }
  }
  
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }

  // --- Silence Detection Logic ---
  private setupSilenceDetection(stream: MediaStream) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.minDecibels = -60; // Silence threshold
    this.analyser.fftSize = 256;
    
    this.microphoneStream = this.audioContext.createMediaStreamSource(stream);
    this.microphoneStream.connect(this.analyser);
    
    this.detectSilence();
  }
  
  private detectSilence() {
    if (!this.analyser || !this.isRecording()) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkVolume = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / bufferLength;
      
      // If volume is low enough to be considered silence
      if (average < 10) { 
        if (!this.silenceTimer) {
          // Start 3 seconds timer
          this.silenceTimer = setTimeout(() => {
            console.log('Silence detected for 3 seconds, stopping recording.');
            this.stopRecording();
          }, 3000);
        }
      } else {
        // Voice detected, reset silence timer
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      }
      
      if (this.isRecording()) {
        this.animationFrameId = requestAnimationFrame(checkVolume);
      }
    };
    
    checkVolume();
  }
  
  private cleanupAudioContext() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
  
  // --- Processing and Chunked Upload chunk Logic ---
  private async processAudio() {
    this.isProcessing.set(true);
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    
    // Convert Blob to File
    const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
    
    await this.uploadAudioWithRetry(audioFile, 0);
  }
  
  private async uploadAudioWithRetry(file: File, retryCount: number) {
    if (!environment.speechToTextApiUrl) {
      console.warn('speechToTextApiUrl is empty. Mocking response for now...');
      setTimeout(() => {
        this.transcribedText.set('هذا نص تجريبي مسجل من الصوت لأن رابط الـ API غير موجود.');
        this.isProcessing.set(false);
      }, 1500);
      return;
    }
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const response: any = await firstValueFrom(
        this.http.post(environment.speechToTextApiUrl, formData)
      );
      this.transcribedText.set(response.text || response.transcript || '');
      this.isProcessing.set(false);
      this.uploadError.set(null);
    } catch (error) {
      console.error(`Upload failed, attempt ${retryCount + 1} of ${this.maxRetries}`, error);
      
      if (retryCount < this.maxRetries) {
        this.uploadError.set('الإنترنت ضعيف، يتم إعادة المحاولة...');
        const delay = this.retryDelayMs * Math.pow(2, retryCount); // Exponential backoff
        setTimeout(() => {
          this.uploadAudioWithRetry(file, retryCount + 1);
        }, delay);
      } else {
        this.isProcessing.set(false);
        this.uploadError.set('فشل إرسال الصوت بسبب ضعف الاتصال. يرجى المحاولة لاحقاً أو كتابة استفسارك.');
      }
    }
  }
}
