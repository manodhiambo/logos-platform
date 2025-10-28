import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../../config/database.config';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum SpiritualJourneyStage {
  SEEKER = 'seeker',
  NEW_BELIEVER = 'new_believer',
  GROWING = 'growing',
  MATURE = 'mature',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export interface UserAttributes {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  spiritualJourneyStage: SpiritualJourneyStage;
  denomination?: string;
  country?: string;
  timezone?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  status: UserStatus;
  lastLoginAt?: Date;
  preferredBibleTranslation: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    prayer: boolean;
    devotional: boolean;
    announcements: boolean;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public username!: string;
  public passwordHash!: string;
  public fullName!: string;
  public avatarUrl?: string;
  public bio?: string;
  public role!: UserRole;
  public spiritualJourneyStage!: SpiritualJourneyStage;
  public denomination?: string;
  public country?: string;
  public timezone?: string;
  public emailVerified!: boolean;
  public emailVerificationToken?: string;
  public emailVerificationExpires?: Date;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public status!: UserStatus;
  public lastLoginAt?: Date;
  public preferredBibleTranslation!: string;
  public notificationSettings!: {
    email: boolean;
    push: boolean;
    prayer: boolean;
    devotional: boolean;
    announcements: boolean;
  };
  public isDeleted!: boolean;
  public deletedAt?: Date;
  public deletedBy?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  public isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  public isModerator(): boolean {
    return (
      this.role === UserRole.MODERATOR ||
      this.role === UserRole.ADMIN ||
      this.role === UserRole.SUPER_ADMIN
    );
  }

  public canPerform(action: string): boolean {
    const permissions: { [key: string]: UserRole[] } = {
      'delete:users': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      'ban:users': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      'moderate:content': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR],
      'delete:content': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR],
      'create:announcements': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
      'manage:communities': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR],
    };
    return permissions[action]?.includes(this.role) || false;
  }

  public toSafeObject(): Partial<UserAttributes> {
    const user = this.get({ plain: true });
    const safe: any = { ...user };
    delete safe.passwordHash;
    delete safe.emailVerificationToken;
    delete safe.passwordResetToken;
    return safe;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_]+$/,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.USER,
      allowNull: false,
    },
    spiritualJourneyStage: {
      type: DataTypes.ENUM(...Object.values(SpiritualJourneyStage)),
      allowNull: false,
    },
    denomination: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      defaultValue: UserStatus.ACTIVE,
      allowNull: false,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferredBibleTranslation: {
      type: DataTypes.STRING,
      defaultValue: 'NKJV',
      allowNull: false,
    },
    notificationSettings: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        push: true,
        prayer: true,
        devotional: true,
        announcements: true,
      },
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['role'] },
      { fields: ['status'] },
      { fields: ['is_deleted'] },
    ],
    // REMOVED PASSWORD HASHING HOOKS - handled in auth service
  }
);

export default User;
