import User from './user.model';
import Community from './community.model';
import CommunityMember from './community-member.model';
import Post from './post.model';
import Comment from './comment.model';
import Like from './like.model';
import PrayerRequest from './prayer-request.model';
import Prayer from './prayer.model';
import Devotional from './devotional.model';
import UserDevotionalProgress from './user-devotional-progress.model';
import Notification from './notification.model';
import AIConversation from './ai-conversation.model';
import AIMessage from './ai-message.model';
import Announcement from './announcement.model';

// ==========================================
// USER ASSOCIATIONS
// ==========================================
User.hasMany(Community, { foreignKey: 'createdBy', as: 'createdCommunities' });
User.hasMany(CommunityMember, { foreignKey: 'userId', as: 'communityMemberships' });
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
User.hasMany(PrayerRequest, { foreignKey: 'userId', as: 'prayerRequests' });
User.hasMany(Prayer, { foreignKey: 'userId', as: 'prayers' });
User.hasMany(Devotional, { foreignKey: 'authorId', as: 'devotionals' });
User.hasMany(UserDevotionalProgress, { foreignKey: 'userId', as: 'devotionalProgress' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(AIConversation, { foreignKey: 'userId', as: 'aiConversations' });
User.hasMany(Announcement, { foreignKey: 'createdBy', as: 'announcements' });

// ==========================================
// COMMUNITY ASSOCIATIONS
// ==========================================
Community.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Community.hasMany(CommunityMember, { foreignKey: 'communityId', as: 'members' });
Community.hasMany(Post, { foreignKey: 'communityId', as: 'posts' });

// ==========================================
// COMMUNITY MEMBER ASSOCIATIONS
// ==========================================
CommunityMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CommunityMember.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });

// ==========================================
// POST ASSOCIATIONS
// ==========================================
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });

// ==========================================
// COMMENT ASSOCIATIONS
// ==========================================
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parentCommentId', as: 'parentComment' });
Comment.hasMany(Comment, { foreignKey: 'parentCommentId', as: 'replies' });
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });

// ==========================================
// LIKE ASSOCIATIONS
// ==========================================
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// ==========================================
// PRAYER REQUEST ASSOCIATIONS
// ==========================================
PrayerRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PrayerRequest.hasMany(Prayer, { foreignKey: 'prayerRequestId', as: 'prayers' });

// ==========================================
// PRAYER ASSOCIATIONS
// ==========================================
Prayer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Prayer.belongsTo(PrayerRequest, { foreignKey: 'prayerRequestId', as: 'prayerRequest' });

// ==========================================
// DEVOTIONAL ASSOCIATIONS
// ==========================================
Devotional.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Devotional.hasMany(UserDevotionalProgress, { foreignKey: 'devotionalId', as: 'userProgress' });

// ==========================================
// USER DEVOTIONAL PROGRESS ASSOCIATIONS
// ==========================================
UserDevotionalProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserDevotionalProgress.belongsTo(Devotional, { foreignKey: 'devotionalId', as: 'devotional' });

// ==========================================
// NOTIFICATION ASSOCIATIONS
// ==========================================
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==========================================
// AI CONVERSATION ASSOCIATIONS
// ==========================================
AIConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AIConversation.hasMany(AIMessage, { foreignKey: 'conversationId', as: 'messages' });

// ==========================================
// AI MESSAGE ASSOCIATIONS
// ==========================================
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversationId', as: 'conversation' });

// ==========================================
// ANNOUNCEMENT ASSOCIATIONS
// ==========================================
Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export {
  User,
  Community,
  CommunityMember,
  Post,
  Comment,
  Like,
  PrayerRequest,
  Prayer,
  Devotional,
  UserDevotionalProgress,
  Notification,
  AIConversation,
  AIMessage,
  Announcement,
};
