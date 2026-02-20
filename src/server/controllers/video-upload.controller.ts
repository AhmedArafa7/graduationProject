import { Request, Response } from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR);

// Configure Multer
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, TEMP_DIR);
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

export const compressVideo = (req: any, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No video file provided' });
    return;
  }

  const inputPath = req.file.path;
  const outputFilename = `${uuidv4()}.mp4`;
  const outputPath = path.join(VIDEOS_DIR, outputFilename);

  console.log(`Starting compression for: ${inputPath}`);

  ffmpeg(inputPath)
    .output(outputPath)
    .videoCodec('libx264')
    .addOption('-crf', '18') // Visually Lossless
    .addOption('-preset', 'slow') // Better compression
    .on('end', () => {
      console.log('Compression finished successfully');
      // Delete temp file
      fs.unlinkSync(inputPath);
      
      // Return public URL
      const publicUrl = `/uploads/videos/${outputFilename}`;
      res.json({ 
        url: publicUrl,
        filename: outputFilename,
        size: fs.statSync(outputPath).size
      });
    })
    .on('error', (err: any) => {
      console.error('Error during compression:', err);
      // Clean up temp file
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      res.status(500).json({ error: 'Video compression failed' });
    })
    .run();
};
