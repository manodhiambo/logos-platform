# LOGOS Platform - Social Features Implementation Guide

## Overview
This document outlines the new social features added to the LOGOS Platform.

## Features Implemented

### 1. Friendship System
- Send/Accept/Reject friend requests
- Remove friends
- View friends list
- Check friendship status between users
- Pending requests (sent & received)

**Endpoints:**
```
POST   /api/v1/friendship/friend-request
PUT    /api/v1/friendship/friend-request/:friendshipId/accept
PUT    /api/v1/friendship/friend-request/:friendshipId/reject
DELETE /api/v1/friendship/friend/:friendshipId
GET    /api/v1/friendship/friends
GET    /api/v1/friendship/friend-requests/pending
GET    /api/v1/friendship/friend-requests/sent
GET    /api/v1/friendship/friendship-status/:otherUserId
```

### 2. Follow System
- Follow/Unfollow users
- View followers
- View following
- Check if following a user

**Endpoints:**
```
POST   /api/v1/friendship/follow
DELETE /api/v1/friendship/follow/:userId
GET    /api/v1/friendship/followers/:userId
GET    /api/v1/friendship/following/:userId
GET    /api/v1/friendship/is-following/:userId
```

### 3. Direct Messaging
- Send messages to users
- View conversations
- View messages with specific user
- Mark messages as read
- Delete messages
- Unread message count

**Endpoints:**
```
POST   /api/v1/messages/send
GET    /api/v1/messages/conversations
GET    /api/v1/messages/conversation/:otherUserId
DELETE /api/v1/messages/:messageId
PUT    /api/v1/messages/read/:senderId
GET    /api/v1/messages/unread-count
```

### 4. User Search
- Search users by name or email
- Exclude current user from results

**Endpoint:**
```
GET /api/v1/friendship/users/search?query=john
```

### 5. Fixed Issues
- ✅ Prayer model description field (now nullable)
- ✅ VideoCall model hostId → createdBy (fixed associations)
- ✅ Community join functionality (proper error handling)

## Database Tables Created

1. **friendships** - Stores friend relationships
2. **follows** - Stores follow relationships
3. **conversations** - Tracks conversations between users
4. **direct_messages** - Stores direct messages

## Migration Steps

### Step 1: Run SQL Migration
```bash
psql -U your_username -d your_database_name -f apps/backend/src/database/migrations/add-social-features.sql
```

### Step 2: Restart Backend
```bash
cd apps/backend
npm run dev
```

### Step 3: Test Endpoints
Use Postman or curl to test the new endpoints.

## Frontend Integration

### Services Created
1. `friendship.service.ts` - Friendship & follow operations
2. `message.service.ts` - Messaging operations

### Components Created
1. `UserProfile.tsx` - User profile with friend/follow actions
2. `messages/page.tsx` - Conversations list
3. `messages/[userId]/page.tsx` - Chat interface

## Usage Examples

### Send Friend Request
```typescript
await friendshipService.sendFriendRequest(userId);
```

### Send Message
```typescript
await messageService.sendMessage(receiverId, "Hello!");
```

### Join Community
```typescript
await communityService.joinCommunity(communityId);
```

## API Response Format

All endpoints follow this format:
```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Security
- All social endpoints require authentication
- Users can only delete their own messages
- Community creators have admin privileges
- Friend requests validated to prevent duplicates

## Next Steps
1. Add real-time messaging with Socket.io
2. Add push notifications for friend requests
3. Add message reactions and typing indicators
4. Add group chats
5. Add voice/video calls integration

## Support
For issues or questions, contact the development team.
