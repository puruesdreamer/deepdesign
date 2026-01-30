import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { isAuthenticated, unauthorizedResponse } from '@/lib/auth';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_DIMENSION = 2048;

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'misc'; // Default to 'misc' if no folder provided

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 20MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process image with Sharp
    let processedBuffer: Buffer = buffer;
    
    let ext = path.extname(file.name).toLowerCase();
    // Default to .jpg if no extension or if we want to normalize
    if (!ext || ext === '.') ext = '.jpg';

    try {
      let image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if too large
      if (metadata.width && (metadata.width > MAX_DIMENSION || (metadata.height && metadata.height > MAX_DIMENSION))) {
        image.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true
        });
      }

      // --- Watermark Logic Start ---
      const watermarkPath = path.join(process.cwd(), 'public', 'images', 'static', 'watermark.png');
      if (fs.existsSync(watermarkPath)) {
          // Commit current changes (resize) to get accurate dimensions for watermark scaling
          const currentBuffer = await image.toBuffer();
          image = sharp(currentBuffer);
          const currentMeta = await image.metadata();

          if (currentMeta.width && currentMeta.height) {
              const wmImage = sharp(watermarkPath);
              const wmMetadata = await wmImage.metadata();
              
              let wmWidth;
               // Check if watermark is "wide" (aspect ratio > 3)
               if (wmMetadata.width && wmMetadata.height && (wmMetadata.width / wmMetadata.height > 3)) {
                    // Wide: 90% * 0.7 = 63%
                    wmWidth = Math.max(Math.floor(currentMeta.width * 0.63), 100);
               } else {
                    // Standard: 30% * 0.7 = 21%
                    wmWidth = Math.max(Math.floor(currentMeta.width * 0.21), 50);
               }

               // Position: Bottom (20% from bottom)
               const marginBottom = Math.floor(currentMeta.height * 0.2);

               try {
                   // 1. Resize Watermark & Apply Opacity
                   const resizedWmBuffer = await wmImage
                       .resize({ width: wmWidth })
                       .toBuffer();
                   
                   // Get dimensions of resized watermark for strip calculation
                   const resizedWmMeta = await sharp(resizedWmBuffer).metadata();
                   const wmHeight = resizedWmMeta.height || 0;

                   // Apply 60% opacity to watermark
                   const processedWmBuffer = await sharp(resizedWmBuffer)
                       .composite([{
                           input: Buffer.from([255, 255, 255, 153]), // 153 = 60% opacity
                           raw: { width: 1, height: 1, channels: 4 },
                           tile: true,
                           blend: 'dest-in'
                       }])
                       .toBuffer();

                   // 2. Create White Strip (10% opacity)
                   // Height = Watermark Height * 1.2 (for padding) (在此处调整白条高度倍数)
                   const stripHeight = Math.floor(wmHeight * 1.2);
                   const stripBuffer = await sharp({
                       create: {
                           width: currentMeta.width,
                           height: stripHeight,
                           channels: 4,
                           background: { r: 255, g: 255, b: 255, alpha: 0.3 } // 0.2 = 20% opacity (在此处调整透明度 0.0-1.0)
                       }
                   })
                   .png()
                   .toBuffer();

                   // 3. Composite Watermark onto Strip (Centered)
                   const finalStripBuffer = await sharp(stripBuffer)
                       .composite([{
                           input: processedWmBuffer,
                           gravity: 'center',
                           blend: 'over'
                       }])
                       .toBuffer();

                   // 4. Composite Strip onto Main Image (with bottom margin)
                   // Use extend to add transparent bottom margin to the strip
                   const positionedStripBuffer = await sharp(finalStripBuffer)
                       .extend({
                           top: 0,
                           bottom: marginBottom,
                           left: 0,
                           right: 0,
                           background: { r: 0, g: 0, b: 0, alpha: 0 }
                       })
                       .toBuffer();

                   // 5. Final Composite
                   image.composite([{
                       input: positionedStripBuffer,
                       gravity: 'south',
                       blend: 'over'
                   }]);

               } catch (wmError) {
                  console.error('Watermark application failed:', wmError);
                  // Continue without watermark if it fails
              }
          }
      }
      // --- Watermark Logic End ---

      // Compress based on format
      if (ext === '.jpg' || ext === '.jpeg') {
          processedBuffer = await image.jpeg({ quality: 80 }).toBuffer();
      } else if (ext === '.png') {
          processedBuffer = await image.png({ quality: 80, compressionLevel: 8 }).toBuffer();
      } else if (ext === '.webp') {
          processedBuffer = await image.webp({ quality: 80 }).toBuffer();
      } else {
          processedBuffer = await image.toBuffer();
      }
      
    } catch (e) {
      console.error('Sharp processing failed, using original buffer', e);
      // Fallback to original buffer if sharp fails (e.g. non-image file)
    }

    // Generate UUID filename
    const filename = `${uuidv4()}${ext}`;
    // Construct path: public/images/uploads/{folder}
    const uploadDir = path.join(process.cwd(), 'public/images/uploads', folder);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, processedBuffer);

    return NextResponse.json({ url: `/images/uploads/${folder}/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return unauthorizedResponse();
  }

  try {
    const { url } = await request.json();
    if (!url || !url.startsWith('/images/uploads/')) {
       return NextResponse.json({ success: true }); // Ignore non-upload files
    }

    const relativePath = url.substring(1); // Remove leading slash
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
