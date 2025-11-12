import communityServiceInstance from './community.service';
import prayerService from './prayer.service';
import devotionalService from './devotional.service';
import messageService from './message.service';
import friendshipService from './friendship.service';
import adminService from './admin.service';
import notificationService from './notification.service';
import postService from './post.service';
import userService from './user.service';
import videoCallService from './video-call.service';
import aiAssistantService from './ai-assistant.service';
import bibleService from './bible.service';

// Export as named exports for consistency
export const communityService = communityServiceInstance;

export {
  prayerService,
  devotionalService,
  messageService,
  friendshipService,
  adminService,
  notificationService,
  postService,
  userService,
  videoCallService,
  aiAssistantService,
  bibleService,
};
