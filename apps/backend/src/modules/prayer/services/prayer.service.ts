import PrayerRequest from '../models/PrayerRequest.model';
import Prayer from '../models/Prayer.model';
import PrayerResponse from '../models/PrayerResponse.model';
import User from '../../../database/models/user.model';
import { sequelize } from '../../../config/database.config';

class PrayerService {
  async createPrayerRequest(userId: string, data: any) {
    try {
      const prayerRequest = await PrayerRequest.create({
        userId,
        title: data.title,
        description: data.description,
        category: data.category,
        privacyLevel: data.privacyLevel || 'public',
        status: 'active',
        prayerCount: 0,
        isAnswered: false,
        isDeleted: false,
      });

      return prayerRequest;
    } catch (error) {
      throw error;
    }
  }

  async getPrayerRequests(filters: any = {}, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const whereClause: any = {
        isDeleted: false,
      };

      // Only show public prayers unless filtering by specific user
      if (!filters.userId) {
        whereClause.privacyLevel = 'public';
      }

      if (filters.category) {
        whereClause.category = filters.category;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      const { rows: prayerRequests, count } = await PrayerRequest.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        prayerRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalRequests: count,
          limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getPrayerRequestById(requestId: string) {
    try {
      const prayerRequest = await PrayerRequest.findOne({
        where: { id: requestId, isDeleted: false },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }],
      });

      return prayerRequest;
    } catch (error) {
      throw error;
    }
  }

  async prayForRequest(requestId: string, message: string | undefined, userId: string) {
    const transaction = await sequelize.transaction();
    
    try {
      const request = await PrayerRequest.findOne({
        where: { id: requestId, isDeleted: false },
      });

      if (!request) {
        throw new Error('Prayer request not found');
      }

      // Create prayer response
      const response = await PrayerResponse.create({
        prayerRequestId: requestId,
        userId,
        message: message || 'Praying for you 🙏',
      }, { transaction });

      // Check if this is user's first prayer for this request
      const userResponseCount = await PrayerResponse.count({
        where: { prayerRequestId: requestId, userId }
      });

      // Only increment count on first prayer
      if (userResponseCount === 1) {
        await request.increment('prayerCount', { by: 1, transaction });
      }

      await transaction.commit();

      return {
        prayer: response,
        updatedPrayerCount: request.prayerCount + (userResponseCount === 1 ? 1 : 0),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPrayers(requestId: string, page: number = 1, limit: number = 50) {
    try {
      const offset = (page - 1) * limit;
      
      const { rows: prayers, count: total } = await PrayerResponse.findAndCountAll({
        where: { prayerRequestId: requestId },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        prayers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePrayerStatus(requestId: string, userId: string, status: string, testimony?: string) {
    try {
      const prayerRequest = await PrayerRequest.findOne({
        where: { id: requestId, userId, isDeleted: false },
      });

      if (!prayerRequest) {
        throw new Error('Prayer request not found or unauthorized');
      }

      const updateData: any = { status };

      if (status === 'answered') {
        updateData.isAnswered = true;
        updateData.answeredAt = new Date();
        if (testimony) {
          updateData.testimonyText = testimony;
        }
      }

      await prayerRequest.update(updateData);
      return prayerRequest;
    } catch (error) {
      throw error;
    }
  }

  async updatePrayerRequest(requestId: string, userId: string, updateData: any) {
    try {
      const prayerRequest = await PrayerRequest.findOne({
        where: { id: requestId, userId, isDeleted: false },
      });

      if (!prayerRequest) {
        throw new Error('Prayer request not found or unauthorized');
      }

      await prayerRequest.update({
        title: updateData.title || prayerRequest.title,
        description: updateData.description || prayerRequest.description,
        category: updateData.category || prayerRequest.category,
      });

      return prayerRequest;
    } catch (error) {
      throw error;
    }
  }

  async deletePrayerRequest(requestId: string, userId: string) {
    try {
      const prayerRequest = await PrayerRequest.findOne({
        where: { id: requestId, userId },
      });

      if (!prayerRequest) {
        throw new Error('Prayer request not found or unauthorized');
      }

      await prayerRequest.update({ isDeleted: true });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getMyPrayerRequests(userId: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { rows: prayerRequests, count } = await PrayerRequest.findAndCountAll({
        where: { userId, isDeleted: false },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        prayerRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalRequests: count,
          limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserPrayers(userId: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get prayer responses user has made
      const { rows: responses, count } = await PrayerResponse.findAndCountAll({
        where: { userId },
        include: [{
          model: PrayerRequest,
          as: 'prayerRequest',
          attributes: ['id', 'title', 'category', 'status'],
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        responses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalPrayers: count,
          limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new PrayerService();
