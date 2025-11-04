import User from '../../../database/models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  async updateProfile(userId: string, updateData: any) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const allowedFields = [
        'fullName',
        'bio',
        'avatarUrl',
        'spiritualJourneyStage',
        'denomination',
        'country',
        'timezone',
        'preferredBibleTranslation',
      ];

      const updateObject: any = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateObject[field] = updateData[field];
        }
      });

      await user.update(updateObject);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role,
        spiritualJourneyStage: user.spiritualJourneyStage,
        denomination: user.denomination,
        country: user.country,
        timezone: user.timezone,
        preferredBibleTranslation: user.preferredBibleTranslation,
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.update({ passwordHash: hashedPassword });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('User not found');
      }

      await user.update({ avatarUrl });

      return {
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ['passwordHash']
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
