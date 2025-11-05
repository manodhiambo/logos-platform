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

// Import VideoCall models if they exist
let VideoCall: any;
let CallParticipant: any;
try {
  VideoCall = require('./video-call.model').default;
  CallParticipant = require('./call-participant.model').default;
} catch (e) {
  console.warn('VideoCall models not found');
}

// Import Announcement model if it exists
let Announcement: any;
try {
  Announcement = require('./announcement.model').default;
} catch (e) {
  console.warn('Announcement model not found');
}

// ==========================================
// CORE ASSOCIATIONS
// ==========================================

// User Associations
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

// Community Associations
Community.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Community.hasMany(CommunityMember, { foreignKey: 'communityId', as: 'members' });
Community.hasMany(Post, { foreignKey: 'communityId', as: 'posts' });

// CommunityMember Associations
CommunityMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CommunityMember.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });

// Post Associations
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });

// Comment Associations
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parentCommentId', as: 'parentComment' });
Comment.hasMany(Comment, { foreignKey: 'parentCommentId', as: 'replies' });
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });

// Like Associations
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// Prayer Request Associations
PrayerRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PrayerRequest.hasMany(Prayer, { foreignKey: 'prayerRequestId', as: 'prayers' });

// Prayer Associations
Prayer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Prayer.belongsTo(PrayerRequest, { foreignKey: 'prayerRequestId', as: 'prayerRequest' });

// Devotional Associations
Devotional.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Devotional.hasMany(UserDevotionalProgress, { foreignKey: 'devotionalId', as: 'userProgress' });

// UserDevotionalProgress Associations
UserDevotionalProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserDevotionalProgress.belongsTo(Devotional, { foreignKey: 'devotionalId', as: 'devotional' });

// Notification Associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// AI Conversation Associations
AIConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AIConversation.hasMany(AIMessage, { foreignKey: 'conversationId', as: 'messages' });

// AI Message Associations
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversationId', as: 'conversation' });

// ==========================================
// OPTIONAL ASSOCIATIONS (VideoCall, Announcement)
// ==========================================

if (VideoCall && CallParticipant) {
  // VideoCall Associations
  User.hasMany(VideoCall, { foreignKey: 'createdBy', as: 'createdVideoCalls' });
  VideoCall.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  VideoCall.hasMany(CallParticipant, { foreignKey: 'callId', as: 'participants' });
  
  // CallParticipant Associations
  CallParticipant.belongsTo(VideoCall, { foreignKey: 'callId', as: 'call' });
  CallParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(CallParticipant, { foreignKey: 'userId', as: 'callParticipations' });
  
  console.log('✅ VideoCall associations initialized');
}

if (Announcement) {
  // Announcement Associations
  User.hasMany(Announcement, { foreignKey: 'createdBy', as: 'announcements' });
  Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  
  console.log('✅ Announcement associations initialized');
}

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
  VideoCall,
  CallParticipant,
  Announcement,
};
