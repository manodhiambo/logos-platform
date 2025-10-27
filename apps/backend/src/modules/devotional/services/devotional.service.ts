import Devotional from '../models/Devotional.model';
import UserDevotionalProgress from '../models/UserDevotionalProgress.model';
import User from '../../../database/models/user.model';
import { Op } from 'sequelize';

class DevotionalService {
  /**
   * Get all devotionals
   */
  async getDevotionals(page: number = 1, limit: number = 20, userId?: string) {
    const offset = (page - 1) * limit;

    const { rows: devotionals, count: total } = await Devotional.findAndCountAll({
      where: { isPublished: true },
      limit,
      offset,
      order: [['publishedDate', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    // Get user progress if userId provided
    let devotionalsWithProgress = devotionals;
    if (userId) {
      const devotionalIds = devotionals.map(d => d.id);
      const userProgress = await UserDevotionalProgress.findAll({
        where: {
          userId,
          devotionalId: { [Op.in]: devotionalIds },
        },
      });

      const progressMap = new Map(userProgress.map(p => [p.devotionalId, p]));

      devotionalsWithProgress = devotionals.map((devotional: any) => {
        const progress = progressMap.get(devotional.id);
        return {
          ...devotional.toJSON(),
          userProgress: progress ? {
            completed: progress.completed,
            completedAt: progress.completedAt,
            hasNotes: !!progress.notes,
          } : null,
        };
      });
    }

    return {
      devotionals: devotionalsWithProgress,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDevotionals: total,
        limit,
      },
    };
  }

  /**
   * Get today's devotional
   */
  async getTodaysDevotional(userId?: string) {
    const today = new Date().toISOString().split('T')[0];

    const devotional = await Devotional.findOne({
      where: {
        publishedDate: today,
        isPublished: true,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!devotional) {
      // If no devotional for today, get the most recent one
      const recentDevotional = await Devotional.findOne({
        where: { isPublished: true },
        order: [['publishedDate', 'DESC']],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatarUrl'],
          },
        ],
      });

      if (!recentDevotional) {
        throw new Error('No devotionals available');
      }

      return this.getDevotionalWithProgress(recentDevotional.id, userId);
    }

    return this.getDevotionalWithProgress(devotional.id, userId);
  }

  /**
   * Get devotional by ID
   */
  async getDevotionalById(devotionalId: string, userId?: string) {
    const devotional = await Devotional.findOne({
      where: { id: devotionalId, isPublished: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl', 'bio'],
        },
      ],
    });

    if (!devotional) {
      throw new Error('Devotional not found');
    }

    // Increment views count
    await devotional.increment('viewsCount', { by: 1 });

    return this.getDevotionalWithProgress(devotionalId, userId);
  }

  /**
   * Get devotional with user progress
   */
  private async getDevotionalWithProgress(devotionalId: string, userId?: string) {
    const devotional = await Devotional.findByPk(devotionalId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatarUrl', 'bio'],
        },
      ],
    });

    if (!devotional) {
      throw new Error('Devotional not found');
    }

    let userProgress: any = null;
    if (userId) {
      const progress = await UserDevotionalProgress.findOne({
        where: { userId, devotionalId },
      });

      if (progress) {
        userProgress = {
          completed: progress.completed,
          notes: progress.notes,
          completedAt: progress.completedAt,
        };
      }
    }

    return {
      ...devotional.toJSON(),
      userProgress,
    };
  }

  /**
   * Mark devotional as complete
   */
  async markAsComplete(devotionalId: string, userId: string) {
    const devotional = await Devotional.findOne({
      where: { id: devotionalId, isPublished: true },
    });

    if (!devotional) {
      throw new Error('Devotional not found');
    }

    const [progress, created] = await UserDevotionalProgress.findOrCreate({
      where: { userId, devotionalId },
      defaults: {
        userId,
        devotionalId,
        completed: true,
        completedAt: new Date(),
      },
    });

    if (!created && !progress.completed) {
      await progress.update({
        completed: true,
        completedAt: new Date(),
      });
    }

    return progress;
  }

  /**
   * Add or update notes
   */
  async addNotes(devotionalId: string, notes: string, userId: string) {
    const devotional = await Devotional.findOne({
      where: { id: devotionalId, isPublished: true },
    });

    if (!devotional) {
      throw new Error('Devotional not found');
    }

    const [progress, created] = await UserDevotionalProgress.findOrCreate({
      where: { userId, devotionalId },
      defaults: {
        userId,
        devotionalId,
        notes,
      },
    });

    if (!created) {
      await progress.update({ notes });
    }

    return progress;
  }

  /**
   * Get user's devotional progress
   */
  async getUserProgress(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: progress, count: total } = await UserDevotionalProgress.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Devotional,
          as: 'devotional',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'fullName', 'avatarUrl'],
            },
          ],
        },
      ],
    });

    return {
      progress,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProgress: total,
        limit,
      },
    };
  }

  /**
   * Get user's stats
   */
  async getUserStats(userId: string) {
    const totalCompleted = await UserDevotionalProgress.count({
      where: { userId, completed: true },
    });

    const currentStreak = await this.calculateStreak(userId);

    const recentProgress = await UserDevotionalProgress.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 7,
    });

    return {
      totalCompleted,
      currentStreak,
      recentActivity: recentProgress.length,
    };
  }

  /**
   * Calculate user's streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    const progress = await UserDevotionalProgress.findAll({
      where: { userId, completed: true },
      order: [['completedAt', 'DESC']],
      limit: 365,
    });

    if (progress.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const p of progress) {
      if (!p.completedAt) continue;

      const completedDate = new Date(p.completedAt);
      completedDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }
}

export default new DevotionalService();
