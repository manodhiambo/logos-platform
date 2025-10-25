import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin, requireSuperAdmin } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  updateUserRoleSchema,
  updateUserStatusSchema,
  deleteUserSchema,
  getUsersListSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  createUserSchema,
  getSystemStatsSchema,
} from '../validators/admin.validator';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// USER MANAGEMENT ROUTES
// Get all users (Admin only)
router.get('/users', requireAdmin, validate(getUsersListSchema), adminController.getAllUsers);

// Get user by ID (Admin only)
router.get('/users/:userId', requireAdmin, adminController.getUserById);

// Create user manually (Admin only)
router.post('/users', requireAdmin, validate(createUserSchema), adminController.createUser);

// Update user role (Super Admin only for admin roles)
router.put('/users/:userId/role', requireAdmin, validate(updateUserRoleSchema), adminController.updateUserRole);

// Update user status (Admin only)
router.put('/users/:userId/status', requireAdmin, validate(updateUserStatusSchema), adminController.updateUserStatus);

// Delete user (Admin only)
router.delete('/users/:userId', requireAdmin, validate(deleteUserSchema), adminController.deleteUser);

// ANNOUNCEMENT ROUTES
// Get all announcements (Admin only)
router.get('/announcements', requireAdmin, adminController.getAllAnnouncements);

// Create announcement (Admin only)
router.post('/announcements', requireAdmin, validate(createAnnouncementSchema), adminController.createAnnouncement);

// Update announcement (Admin only)
router.put('/announcements/:announcementId', requireAdmin, validate(updateAnnouncementSchema), adminController.updateAnnouncement);

// Delete announcement (Admin only)
router.delete('/announcements/:announcementId', requireAdmin, adminController.deleteAnnouncement);

// SYSTEM STATISTICS
// Get system stats (Admin only)
router.get('/stats', requireAdmin, validate(getSystemStatsSchema), adminController.getSystemStats);

export default router;
