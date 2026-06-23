import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');

/** Multer options for image uploads: stores to /uploads, image-only, 5MB max. */
export function imageUploadOptions(prefix: string) {
  return {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: (err: Error | null, dest: string) => void) => {
        if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
      },
      filename: (_req: any, file: any, cb: (err: Error | null, name: string) => void) => {
        const unique = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    fileFilter: (_req: any, file: any, cb: (err: Error | null, accept: boolean) => void) => {
      if (!/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  };
}
