import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComparisonService } from '../../core/services/comparison.service';
import { ComparisonProperty, ComparisonResult } from '../../core/models/comparison.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comparison-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparison-modal.component.html',
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ComparisonModalComponent implements OnInit {
  @Input({ required: true }) properties: ComparisonProperty[] = [];
  @Output() close = new EventEmitter<void>();

  private comparisonService = inject(ComparisonService);

  result = signal<ComparisonResult | null>(null);
  
  // Chat State
  messages = signal<{type: 'user' | 'ai', text: string}[]>([]);
  userQuestion = signal('');
  isThinking = signal(false);

  ngOnInit() {
    this.analyze();
  }

  analyze() {
    if (this.properties.length < 2) return;
    const res = this.comparisonService.analyze(this.properties);
    this.result.set(res);
  }

  async askAi() {
    if (!this.userQuestion().trim() || this.isThinking()) return;

    const question = this.userQuestion();
    this.messages.update(m => [...m, { type: 'user', text: question }]);
    this.userQuestion.set('');
    this.isThinking.set(true);

    try {
      const answer = await this.comparisonService.askAi(question, this.properties);
      this.messages.update(m => [...m, { type: 'ai', text: answer }]);
    } catch (e) {
      this.messages.update(m => [...m, { type: 'ai', text: 'عذراً، حدث خطأ أثناء المعالجة.' }]);
    } finally {
      this.isThinking.set(false);
    }
  }

  closeModal() {
    this.close.emit();
  }

  // Helper for strict template checking
  getAnalysis(res: ComparisonResult, id: string | number) {
    return res.analysis[id];
  }
}
