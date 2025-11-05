import { PrayerRequest, Prayer, User } from '../../../database/models';
import { PrayerStatus } from '../../../database/models/prayer-request.model';

class PrayerService {
  async createPrayerRequest(userId: string, data: any) {
    try {
      const prayerRequest = await PrayerRequest.create({
        userId,
        title: data.title,
        description: data.description,
        category: data.category,
        privacyLevel: data.privacyLevel || 'public',
        status: PrayerStatus.ACTIVE,
        prayerCount: 0,
      });

      return prayerRequest;
    } catch (error: any) {
      throw new Error(`Failed to create prayer request: ${error.message}`);
    }
  }

  async getPrayerRequests(filters: any, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;

    const { rows: prayerRequests, count: total } = await PrayerRequest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePictureUrl'],
        },
      ],
    });

    return {
      prayerRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPrayerRequestById(requestId: string) {
    const prayerRequest = await PrayerRequest.findOne({
      where: { id: requestId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePictureUrl'],
        },
      ],
    });

    return prayerRequest;
  }

  async updatePrayerRequest(requestId: string, userId: string, data: any) {
    const prayerRequest = await PrayerRequest.findOne({
      where: { id: requestId, userId },
    });

    if (!prayerRequest) {
      throw new Error('Prayer request not found or you do not have permission to update it');
    }

    await prayerRequest.update(data);
    return prayerRequest;
  }

  async deletePrayerRequest(requestId: string, userId: string) {
    const prayerRequest = await PrayerRequest.findOne({
      where: { id: requestId, userId },
    });

    if (!prayerRequest) {
      throw new Error('Prayer request not found or you do not have permission to delete it');
    }

    await prayerRequest.destroy();
  }

  async prayForRequest(requestId: string, message: string, userId: string) {
    const prayerRequest = await PrayerRequest.findByPk(requestId);

    if (!prayerRequest) {
      throw new Error('Prayer request not found');
    }

    const prayer = await Prayer.create({
      prayerRequestId: requestId,
      userId,
      message: message || '',
    });

    await prayerRequest.increment('prayerCount');

    return {
      prayer,
      prayerCount: prayerRequest.prayerCount + 1,
    };
  }

  async getPrayers(requestId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: prayers, count: total } = await Prayer.findAndCountAll({
      where: { prayerRequestId: requestId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profilePictureUrl'],
        },
      ],
    });

    return {
      prayers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePrayerStatus(requestId: string, userId: string, status: string, testimony?: string) {
    const prayerRequest = await PrayerRequest.findOne({
      where: { id: requestId, userId },
    });

    if (!prayerRequest) {
      throw new Error('Prayer request not found or you do not have permission to update it');
    }

    const updateData: any = { status };
    if (status === PrayerStatus.ANSWERED) {
      updateData.answeredAt = new Date();
    }

    await prayerRequest.update(updateData);
    return prayerRequest;
  }

  async getMyPrayerRequests(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: prayerRequests, count: total } = await PrayerRequest.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      prayerRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new PrayerService();
