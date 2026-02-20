import { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
 
// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

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

export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const processImage = async (req: any, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }

  const inputPath = req.file.path;
  const outputFilename = `${uuidv4()}.webp`;
  const outputPath = path.join(IMAGES_DIR, outputFilename);

  try {
    console.log(`Starting image processing for: ${inputPath}`);

    // High Fidelity Compression
    await sharp(inputPath)
      .webp({ 
        quality: 90, 
        effort: 6 // 0 (fastest) to 6 (slowest, best compression)
      })
      .toFile(outputPath);

    console.log('Image processing finished successfully');
    
    // Delete temp file
    fs.unlinkSync(inputPath);
    
    // Return public URL
    const publicUrl = `/uploads/images/${outputFilename}`;
    res.json({ 
      url: publicUrl,
      filename: outputFilename,
      size: fs.statSync(outputPath).size
    });

  } catch (err) {
    console.error('Error during image processing:', err);
    // Clean up temp file
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: 'Image processing failed' });
    return;
  }
};
