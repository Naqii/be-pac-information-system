import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Untuk single file
export const resizeSingleImage = (width = 1200, quality = 80) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    try {
      req.file.buffer = await sharp(req.file.buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality }) // simpan ke webp agar lebih kecil
        .toBuffer();

      // ubah ext jadi .webp
      req.file.originalname = req.file.originalname.replace(
        /\.[^.]+$/,
        '.webp'
      );
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Untuk multiple files
export const resizeMultipleImages = (width = 1200, quality = 80) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next();

    try {
      const files = req.files as Express.Multer.File[];
      await Promise.all(
        files.map(async (file) => {
          file.buffer = await sharp(file.buffer)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality })
            .toBuffer();

          file.originalname = file.originalname.replace(/\.[^.]+$/, '.webp');
        })
      );
      next();
    } catch (err) {
      next(err);
    }
  };
};
