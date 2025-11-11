import { Friendship, User, Follow } from '../../../database/models';
import { FriendshipStatus } from '../../../database/models/friendship.model';
import { Op } from 'sequelize';
import NotificationService from '../../../services/notification.service';

class FriendshipService {
  // Send friend request
  async sendFriendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new Error('You cannot send a friend request to yourself');
    }

    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new Error('You are already friends');
      }
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new Error('Friend request already sent');
      }
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new Error('Cannot send friend request');
      }
    }

    const friendship = await Friendship.create({
      requesterId,
      addresseeId,
      status: FriendshipStatus.PENDING,
    });

    // Get requester info and notify
    const requester = await User.findByPk(requesterId);
    if (requester) {
      await NotificationService.notifyFriendRequest(
        requesterId,
        addresseeId,
        requester.fullName
      );
    }

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`user:${addresseeId}`).emit('friend-request:new', {
        friendship,
        requester: {
          id: requester?.id,
          fullName: requester?.fullName,
          avatarUrl: requester?.avatarUrl,
        },
      });
    }

    return friendship;
  }

  // Accept friend request
  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await Friendship.findByPk(friendshipId);

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.addresseeId !== userId) {
      throw new Error('You can only accept requests sent to you');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new Error('This request cannot be accepted');
    }

    friendship.status = FriendshipStatus.ACCEPTED;
    await friendship.save();

    // Get accepter info and notify requester
    const accepter = await User.findByPk(userId);
    if (accepter) {
      await NotificationService.notifyFriendAccepted(
        userId,
        friendship.requesterId,
        accepter.fullName
      );
    }

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`user:${friendship.requesterId}`).emit('friend-request:accepted', {
        friendship,
        accepter: {
          id: accepter?.id,
          fullName: accepter?.fullName,
          avatarUrl: accepter?.avatarUrl,
        },
      });
    }

    return friendship;
  }

  // Reject friend request
  async rejectFriendRequest(friendshipId: string, userId: string) {
    const friendship = await Friendship.findByPk(friendshipId);

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.addresseeId !== userId) {
      throw new Error('You can only reject requests sent to you');
    }

    friendship.status = FriendshipStatus.REJECTED;
    await friendship.save();

    return friendship;
  }

  // Remove friend
  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await Friendship.findByPk(friendshipId);

    if (!friendship) {
      throw new Error('Friendship not found');
    }

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new Error('You can only remove your own friendships');
    }

    await friendship.destroy();
  }

  // Get all friends
  async getFriends(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: friendships, count: total } = await Friendship.findAndCountAll({
      where: {
        [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
        status: FriendshipStatus.ACCEPTED,
      },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
        },
        {
          model: User,
          as: 'addressee',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const friends = friendships.map((friendship: any) => {
      const friend =
        friendship.requesterId === userId
          ? friendship.addressee
          : friendship.requester;
      return {
        friendshipId: friendship.id,
        friend,
        friendsSince: friendship.createdAt,
      };
    });

    return {
      friends,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get pending friend requests (received)
  async getPendingRequests(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: requests, count: total } = await Friendship.findAndCountAll({
      where: {
        addresseeId: userId,
        status: FriendshipStatus.PENDING,
      },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get sent friend requests
  async getSentRequests(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: requests, count: total } = await Friendship.findAndCountAll({
      where: {
        requesterId: userId,
        status: FriendshipStatus.PENDING,
      },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'addressee',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Check friendship status
  async checkFriendshipStatus(userId: string, otherUserId: string) {
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId: userId, addresseeId: otherUserId },
          { requesterId: otherUserId, addresseeId: userId },
        ],
      },
    });

    if (!friendship) {
      return { status: 'none', friendshipId: null };
    }

    return {
      status: friendship.status,
      friendshipId: friendship.id,
      isRequester: friendship.requesterId === userId,
    };
  }

  // Follow a user
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new Error('You are already following this user');
    }

    const follow = await Follow.create({
      followerId,
      followingId,
    });

    // Get follower info and notify
    const follower = await User.findByPk(followerId);
    if (follower) {
      await NotificationService.notifyNewFollower(
        followerId,
        followingId,
        follower.fullName
      );
    }

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`user:${followingId}`).emit('follow:new', {
        follower: {
          id: follower?.id,
          fullName: follower?.fullName,
          avatarUrl: follower?.avatarUrl,
        },
      });
    }

    return follow;
  }

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string) {
    const follow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new Error('You are not following this user');
    }

    await follow.destroy();
  }

  // Get followers
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: follows, count: total } = await Follow.findAndCountAll({
      where: { followingId: userId },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'follower',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const followers = follows.map((follow: any) => ({
      followId: follow.id,
      user: follow.follower,
      followedAt: follow.createdAt,
    }));

    return {
      followers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get following
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: follows, count: total } = await Follow.findAndCountAll({
      where: { followerId: userId },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'following',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const following = follows.map((follow: any) => ({
      followId: follow.id,
      user: follow.following,
      followedAt: follow.createdAt,
    }));

    return {
      following,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Check if following
  async isFollowing(followerId: string, followingId: string) {
    const follow = await Follow.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }

  // Search users
  async searchUsers(query: string, currentUserId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: users, count: total } = await User.findAndCountAll({
      where: {
        [Op.and]: [
          {
            id: {
              [Op.ne]: currentUserId,
            },
          },
          {
            [Op.or]: [
              {
                fullName: {
                  [Op.iLike]: `%${query}%`,
                },
              },
              {
                email: {
                  [Op.iLike]: `%${query}%`,
                },
              },
            ],
          },
        ],
      },
      attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
      limit,
      offset,
      order: [['fullName', 'ASC']],
    });

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new FriendshipService();
