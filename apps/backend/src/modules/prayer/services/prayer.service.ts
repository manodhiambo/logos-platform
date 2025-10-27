import PrayerRequest from '../models/PrayerRequest.model';
import Prayer from '../models/Prayer.model';
import User from '../../../database/models/user.model';
import { Op } from 'sequelize';

class PrayerService {
  /**
   * Create a prayer request
   */
  async createPrayerRequest(data: any, userId: string) {
    const prayerRequest = await PrayerRequest.create({
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      privacyLevel: data.privacyLevel || 'public',
      status: 'active',
      prayerCount: 0,
    });

    // Fetch with author details
    const createdRequest = await PrayerRequest.findByPk(prayerRequest.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    return createdRequest;
  }

  /**
   * Get prayer requests
   */
  async getPrayerRequests(filters: any, userId: string | undefined, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = { isDeleted: false };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    // Only show public prayer requests unless it's the user's own
    if (!filters.userId || filters.userId !== userId) {
      where.privacyLevel = 'public';
    }

    const { rows: requests, count: total } = await PrayerRequest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    // Check if user has prayed for each request
    let requestsWithPrayerStatus = requests;
    if (userId) {
      const requestIds = requests.map(r => r.id);
      const userPrayers = await Prayer.findAll({
        where: {
          prayerRequestId: { [Op.in]: requestIds },
          userId,
        },
        attributes: ['prayerRequestId'],
      });

      const prayedRequestIds = new Set(userPrayers.map(p => p.prayerRequestId));

      requestsWithPrayerStatus = requests.map((request: any) => ({
        ...request.toJSON(),
        hasPrayed: prayedRequestIds.has(request.id),
      }));
    }

    return {
      prayerRequests: requestsWithPrayerStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        limit,
      },
    };
  }

  /**
   * Get prayer request by ID
   */
  async getPrayerRequestById(requestId: string, userId: string | undefined) {
    const request = await PrayerRequest.findOne({
      where: { id: requestId, isDeleted: false },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl', 'bio'],
        },
      ],
    });

    if (!request) {
      throw new Error('Prayer request not found');
    }

    // Check privacy
    if (request.privacyLevel === 'private' && request.userId !== userId) {
      throw new Error('You do not have permission to view this prayer request');
    }

    let hasPrayed = false;
    if (userId) {
      const prayer = await Prayer.findOne({
        where: { prayerRequestId: requestId, userId },
      });
      hasPrayed = !!prayer;
    }

    return {
      ...request.toJSON(),
      hasPrayed,
    };
  }

  /**
   * Update prayer request
   */
  async updatePrayerRequest(requestId: string, data: any, userId: string) {
    const request = await PrayerRequest.findOne({
      where: { id: requestId, isDeleted: false },
    });

    if (!request) {
      throw new Error('Prayer request not found');
    }

    if (request.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own prayer requests');
    }

    await request.update({
      title: data.title || request.title,
      description: data.description || request.description,
      category: data.category || request.category,
      privacyLevel: data.privacyLevel || request.privacyLevel,
    });

    return request;
  }

  /**
   * Delete prayer request
   */
  async deletePrayerRequest(requestId: string, userId: string) {
    const request = await PrayerRequest.findOne({
      where: { id: requestId, isDeleted: false },
    });

    if (!request) {
      throw new Error('Prayer request not found');
    }

    if (request.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own prayer requests');
    }

    await request.update({ isDeleted: true });

    return { message: 'Prayer request deleted successfully' };
  }

  /**
   * Pray for a request
   */
  async prayForRequest(requestId: string, message: string | undefined, userId: string) {
    const request = await PrayerRequest.findOne({
      where: { id: requestId, isDeleted: false },
    });

    if (!request) {
      throw new Error('Prayer request not found');
    }

    // Check if already prayed
    const existingPrayer = await Prayer.findOne({
      where: { prayerRequestId: requestId, userId },
    });

    if (existingPrayer) {
      throw new Error('You have already prayed for this request');
    }

    // Create prayer
    const prayer = await Prayer.create({
      prayerRequestId: requestId,
      userId,
      message: message || null,
    });

    // Increment prayer count
    await request.increment('prayerCount', { by: 1 });

    return {
      prayer,
      updatedPrayerCount: request.prayerCount + 1,
    };
  }

  /**
   * Get prayers for a request
   */
  async getPrayers(requestId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: prayers, count: total } = await Prayer.findAndCountAll({
      where: { prayerRequestId: requestId },
      limit,
      offset,
      order: [['prayedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    return {
      prayers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPrayers: total,
        limit,
      },
    };
  }

  /**
   * Update prayer request status
   */
  async updateStatus(requestId: string, status: string, testimony: string | undefined, userId: string) {
    const request = await PrayerRequest.findOne({
      where: { id: requestId, isDeleted: false },
    });

    if (!request) {
      throw new Error('Prayer request not found');
    }

    if (request.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own prayer requests');
    }

    const updateData: any = { status };

    if (status === 'answered') {
      updateData.answeredAt = new Date();
      if (testimony) {
        updateData.testimony = testimony;
      }
    }

    await request.update(updateData);

    return request;
  }

  /**
   * Get user's prayer requests
   */
  async getUserPrayerRequests(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: requests, count: total } = await PrayerRequest.findAndCountAll({
      where: { userId, isDeleted: false },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      prayerRequests: requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        limit,
      },
    };
  }
}

export default new PrayerService();
