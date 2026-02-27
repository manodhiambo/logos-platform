import { Request, Response } from 'express';
import { logger } from '../../../shared/utils/logger.util';

export const uploadPostImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No files uploaded' },
      });
    }

    const urls = files.map((file: any) => ({
      url: file.path || file.secure_url,
      type: 'image',
      publicId: file.filename || file.public_id,
    }));

    logger.info(`Uploaded ${files.length} post image(s)`);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { files: urls },
    });
  } catch (error: any) {
    logger.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to upload images' },
    });
  }
};

export const uploadPostVideo = async (req: Request, res: Response) => {
  try {
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No video file uploaded' },
      });
    }

    const videoData = {
      url: file.path || file.secure_url,
      type: 'video',
      publicId: file.filename || file.public_id,
    };

    logger.info(`Uploaded post video: ${videoData.publicId}`);

    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { file: videoData },
    });
  } catch (error: any) {
    logger.error('Video upload error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to upload video' },
    });
  }
};

export const uploadStatusMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No media file uploaded' },
      });
    }

    const isVideo = file.mimetype?.startsWith('video/');

    const mediaData = {
      url: file.path || file.secure_url,
      type: isVideo ? 'video' : 'image',
      publicId: file.filename || file.public_id,
    };

    logger.info(`Uploaded status media: ${mediaData.type}`);

    return res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      data: { file: mediaData },
    });
  } catch (error: any) {
    logger.error('Status media upload error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to upload media' },
    });
  }
};
