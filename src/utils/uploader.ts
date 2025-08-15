import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from './env';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const toDataURL = (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataURL = `data:${file.mimetype};base64,${b64}`;
  return dataURL;
};

const getPublicIdFromFileUrl = (fileUrl: string) => {
  const fileNameUsingSubstring = fileUrl.substring(
    fileUrl.lastIndexOf('/') + 1
  );
  const publicId = fileNameUsingSubstring.substring(
    0,
    fileNameUsingSubstring.lastIndexOf('.')
  );
  return publicId;
};

export default {
  async uploadSingle(file: Express.Multer.File) {
    try {
      const fileDataURL = toDataURL(file);
      const result = await cloudinary.uploader.upload(fileDataURL, {
        resource_type: 'auto',
      });
      return result;
    } catch (error) {
      console.error('Error uploading file: ', error);
      throw new Error('Failed to upload file');
    }
  },

  async uploadMultiple(files: Express.Multer.File[]) {
    try {
      const uploadBatch = files.map((item) => this.uploadSingle(item));
      const result = await Promise.all(uploadBatch);
      return result;
    } catch (error) {
      console.error('Error uploading multiple file: ', error);
      throw new Error('Failed to upload files');
    }
  },

  async remove(fileUrl: string) {
    try {
      const publicId = getPublicIdFromFileUrl(fileUrl);
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error removing file: ', error);
      throw new Error('Failed to remove file');
    }
  },
};
