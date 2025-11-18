import { Router } from 'express';
import Announcement from '../../../database/models/announcement.model';

const router = Router();

/**
 * @route   GET /api/v1/announcements/active
 * @desc    Get active announcements (public - no auth required)
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    
    const announcements = await Announcement.findAll({
      where: {
        status: 'published',
        isGlobal: true,
      },
      order: [
        ['priority', 'DESC'],
        ['publishedAt', 'DESC'],
      ],
    });

    // Filter out expired announcements
    const activeAnnouncements = announcements.filter(announcement => {
      const publishedAt = announcement.publishedAt ? new Date(announcement.publishedAt) : null;
      const expiresAt = announcement.expiresAt ? new Date(announcement.expiresAt) : null;

      // Check if published
      if (publishedAt && publishedAt > now) {
        return false;
      }

      // Check if expired
      if (expiresAt && expiresAt < now) {
        return false;
      }

      return true;
    });

    res.json({
      success: true,
      data: {
        announcements: activeAnnouncements,
        count: activeAnnouncements.length,
      },
    });
  } catch (error: any) {
    console.error('Get active announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message,
    });
  }
});

export default router;
