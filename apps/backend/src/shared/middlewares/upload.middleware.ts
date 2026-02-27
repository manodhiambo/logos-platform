import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.config';
import path from 'path';

// Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  } as any,
});

// Cloudinary storage for community images
const communityStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'communities',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 400, crop: 'fill' }],
  } as any,
});

// Cloudinary storage for post images
const postImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'logos-platform/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
  } as any,
});

// Cloudinary storage for post videos
const postVideoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'logos-platform/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    resource_type: 'video',
  } as any,
});

// Cloudinary storage for status media (images + videos)
const statusMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req: any, file: Express.Multer.File) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'logos-platform/status',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'webm']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      resource_type: isVideo ? 'video' : 'image',
    };
  },
} as any);

// Image-only file filter
const imageFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Media file filter (images + videos)
const mediaFilter = (req: any, file: any, cb: any) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoMimes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/webm'];

  const isImage = allowedImageTypes.test(file.mimetype) && allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const isVideo = allowedVideoMimes.includes(file.mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, WebM) are allowed.'));
  }
};

// Upload configurations
export const uploadAvatar = multer({
  storage: avatarStorage as any,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadCommunityImage = multer({
  storage: communityStorage as any,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadPostImages = multer({
  storage: postImageStorage as any,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 4 }, // 10MB per file, max 4
});

export const uploadPostVideo = multer({
  storage: postVideoStorage as any,
  fileFilter: mediaFilter,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 }, // 100MB for video
});

export const uploadStatusMedia = multer({
  storage: statusMediaStorage as any,
  fileFilter: mediaFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // 50MB
});

export default {
  uploadAvatar,
  uploadCommunityImage,
  uploadPostImages,
  uploadPostVideo,
  uploadStatusMedia,
};
