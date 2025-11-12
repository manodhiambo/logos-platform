import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhcrj4oyi',
  api_key: process.env.CLOUDINARY_API_KEY || '533963266424583',
  api_secret: process.env.**********,
});

export default cloudinary;
