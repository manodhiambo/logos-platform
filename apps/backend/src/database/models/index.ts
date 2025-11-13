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
import VideoCall from './video-call.model';
import CallParticipant from './call-participant.model';
import Friendship from './friendship.model';
import Follow from './follow.model';
import DirectMessage from './direct-message.model';
import Conversation from './conversation.model';
import MessageReaction from './message-reaction.model';
import GroupChat from './group-chat.model';
import GroupMember from './group-member.model';
import GroupMessage from './group-message.model';

// ==================== User Associations ====================
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
User.hasMany(Announcement, { foreignKey: 'authorId', as: 'announcements' });
User.hasMany(VideoCall, { foreignKey: 'hostId', as: 'createdVideoCalls' });
User.hasMany(CallParticipant, { foreignKey: 'userId', as: 'callParticipations' });
User.hasMany(Friendship, { foreignKey: 'requesterId', as: 'sentFriendRequests' });
User.hasMany(Friendship, { foreignKey: 'addresseeId', as: 'receivedFriendRequests' });
User.hasMany(Follow, { foreignKey: 'followerId', as: 'following' });
User.hasMany(Follow, { foreignKey: 'followingId', as: 'followers' });
User.hasMany(DirectMessage, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(DirectMessage, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversationsAsParticipant1' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversationsAsParticipant2' });
User.hasMany(MessageReaction, { foreignKey: 'userId', as: 'messageReactions' });
User.hasMany(GroupChat, { foreignKey: 'createdBy', as: 'createdGroups' });
User.hasMany(GroupMember, { foreignKey: 'userId', as: 'groupMemberships' });
User.hasMany(GroupMessage, { foreignKey: 'senderId', as: 'groupMessages' });

// ==================== Community Associations ====================
Community.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Community.hasMany(CommunityMember, { foreignKey: 'communityId', as: 'members' });
Community.hasMany(Post, { foreignKey: 'communityId', as: 'posts' });

// ==================== CommunityMember Associations ====================
CommunityMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CommunityMember.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });

// ==================== Post Associations ====================
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });

// ==================== Comment Associations ====================
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parentCommentId', as: 'parentComment' });
Comment.hasMany(Comment, { foreignKey: 'parentCommentId', as: 'replies' });
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });

// ==================== Like Associations ====================
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// ==================== Prayer Request Associations ====================
PrayerRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PrayerRequest.hasMany(Prayer, { foreignKey: 'prayerRequestId', as: 'prayers' });

// ==================== Prayer Associations ====================
Prayer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Prayer.belongsTo(PrayerRequest, { foreignKey: 'prayerRequestId', as: 'prayerRequest' });

// ==================== Devotional Associations ====================
Devotional.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Devotional.hasMany(UserDevotionalProgress, { foreignKey: 'devotionalId', as: 'userProgress' });

// ==================== UserDevotionalProgress Associations ====================
UserDevotionalProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserDevotionalProgress.belongsTo(Devotional, { foreignKey: 'devotionalId', as: 'devotional' });

// ==================== Notification Associations ====================
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==================== AI Conversation Associations ====================
AIConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AIConversation.hasMany(AIMessage, { foreignKey: 'conversationId', as: 'messages' });

// ==================== AI Message Associations ====================
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversationId', as: 'conversation' });

// ==================== Announcement Associations ====================
Announcement.belongsTo(User, { foreignKey: 'authorId', as: 'creator' });

// ==================== VideoCall Associations ====================
VideoCall.belongsTo(User, { foreignKey: 'hostId', as: 'host' });
VideoCall.hasMany(CallParticipant, { foreignKey: 'callId', as: 'participants' });

// ==================== CallParticipant Associations ====================
CallParticipant.belongsTo(VideoCall, { foreignKey: 'callId', as: 'call' });
CallParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==================== Friendship Associations ====================
Friendship.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Friendship.belongsTo(User, { foreignKey: 'addresseeId', as: 'addressee' });

// ==================== Follow Associations ====================
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });

// ==================== DirectMessage Associations ====================
DirectMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
DirectMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
DirectMessage.hasMany(MessageReaction, { foreignKey: 'messageId', as: 'reactions' });

// ==================== Conversation Associations ====================
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });

// ==================== MessageReaction Associations ====================
MessageReaction.belongsTo(DirectMessage, { foreignKey: 'messageId', as: 'message' });
MessageReaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==================== GroupChat Associations ====================
GroupChat.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
GroupChat.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
GroupChat.hasMany(GroupMessage, { foreignKey: 'groupId', as: 'messages' });

// ==================== GroupMember Associations ====================
GroupMember.belongsTo(GroupChat, { foreignKey: 'groupId', as: 'group' });
GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==================== GroupMessage Associations ====================
GroupMessage.belongsTo(GroupChat, { foreignKey: 'groupId', as: 'group' });
GroupMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

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
  VideoCall,
  CallParticipant,
  Friendship,
  Follow,
  DirectMessage,
  Conversation,
  MessageReaction,
  GroupChat,
  GroupMember,
  GroupMessage,
};
