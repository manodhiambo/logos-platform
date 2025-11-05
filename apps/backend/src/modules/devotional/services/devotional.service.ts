import { Devotional, UserDevotionalProgress, User } from '../../../database/models';
import { Op } from 'sequelize';

class DevotionalService {
  async getDevotionals(page: number = 1, limit: number = 20, userId?: string) {
    const offset = (page - 1) * limit;

    const { rows: devotionals, count: total } = await Devotional.findAndCountAll({
      limit,
      offset,
      order: [['publishedDate', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (userId) {
      const devotionalIds = devotionals.map((d: any) => d.id);
      const progress = await UserDevotionalProgress.findAll({
        where: {
          userId,
          devotionalId: { [Op.in]: devotionalIds },
        },
      });

      const progressMap = new Map(progress.map((p: any) => [p.devotionalId, p]));
      
      devotionals.forEach((devotional: any) => {
        const userProgress = progressMap.get(devotional.id);
        devotional.dataValues.isCompleted = userProgress?.completed || false;
        devotional.dataValues.notes = userProgress?.notes || null;
      });
    }

    return {
      devotionals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTodaysDevotional(userId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const devotional = await Devotional.findOne({
      where: {
        publishedDate: {
          [Op.gte]: today,
          [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!devotional) {
      return null;
    }

    if (userId) {
      const progress = await UserDevotionalProgress.findOne({
        where: { userId, devotionalId: devotional.id },
      });

      (devotional as any).dataValues.isCompleted = progress?.completed || false;
      (devotional as any).dataValues.notes = progress?.notes || null;
    }

    return devotional;
  }

  async getDevotionalById(devotionalId: string, userId?: string) {
    const devotional = await Devotional.findByPk(devotionalId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!devotional) {
      throw new Error('Devotional not found');
    }

    if (userId) {
      const progress = await UserDevotionalProgress.findOne({
        where: { userId, devotionalId },
      });

      (devotional as any).dataValues.isCompleted = progress?.completed || false;
      (devotional as any).dataValues.notes = progress?.notes || null;
    }

    return devotional;
  }

  async markAsComplete(devotionalId: string, userId: string) {
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

  async addNotes(devotionalId: string, notes: string, userId: string) {
    const [progress] = await UserDevotionalProgress.findOrCreate({
      where: { userId, devotionalId },
      defaults: {
        userId,
        devotionalId,
        notes,
        completed: false,
      },
    });

    await progress.update({ notes });
    return progress;
  }

  async getUserProgress(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: progress, count: total } = await UserDevotionalProgress.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['completedAt', 'DESC']],
      include: [
        {
          model: Devotional,
          as: 'devotional',
        },
      ],
    });

    return {
      progress,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserStats(userId: string) {
    const totalCompleted = await UserDevotionalProgress.count({
      where: { userId, completed: true },
    });

    const currentStreak = await this.calculateStreak(userId);
    const longestStreak = await this.calculateLongestStreak(userId);

    return {
      totalCompleted,
      currentStreak,
      longestStreak,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const progress = await UserDevotionalProgress.findAll({
      where: { userId, completed: true },
      order: [['completedAt', 'DESC']],
      attributes: ['completedAt'],
    });

    if (progress.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompleted = new Date(progress[0].completedAt!);
    lastCompleted.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0;

    for (let i = 1; i < progress.length; i++) {
      const current = new Date(progress[i - 1].completedAt!);
      const previous = new Date(progress[i].completedAt!);
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private async calculateLongestStreak(userId: string): Promise<number> {
    const progress = await UserDevotionalProgress.findAll({
      where: { userId, completed: true },
      order: [['completedAt', 'ASC']],
      attributes: ['completedAt'],
    });

    if (progress.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < progress.length; i++) {
      const current = new Date(progress[i].completedAt!);
      const previous = new Date(progress[i - 1].completedAt!);
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }
}

export default new DevotionalService();
