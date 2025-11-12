import authService from './auth.service';
import communityServiceInstance from './community.service';
import prayerService from './prayer.service';
import devotionalService from './devotional.service';
import messageService from './message.service';
import friendshipService from './friendship.service';
import adminService from './admin.service';

// Export as named exports for consistency
export const communityService = communityServiceInstance;

export {
  authService,
  prayerService,
  devotionalService,
  messageService,
  friendshipService,
  adminService,
};
