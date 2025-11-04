import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum PrayerCategory {
  PERSONAL = 'personal',
  FAMILY = 'family',
  HEALTH = 'health',
  GUIDANCE = 'guidance',
  THANKSGIVING = 'thanksgiving',
  OTHER = 'other',
}

export enum PrayerPrivacyLevel {
  PUBLIC = 'public',
  COMMUNITY = 'community',
  PRIVATE = 'private',
}

export enum PrayerStatus {
  ACTIVE = 'active',
  ANSWERED = 'answered',
  ONGOING = 'ongoing',
}

export interface PrayerRequestAttributes {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: PrayerCategory;
  privacyLevel: PrayerPrivacyLevel;
  status: PrayerStatus;
  prayerCount: number;
  answeredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class PrayerRequest extends Model<PrayerRequestAttributes> implements PrayerRequestAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public category!: PrayerCategory;
  public privacyLevel!: PrayerPrivacyLevel;
  public status!: PrayerStatus;
  public prayerCount!: number;
  public answeredAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PrayerRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(PrayerCategory)),
      allowNull: false,
      defaultValue: PrayerCategory.PERSONAL,
    },
    privacyLevel: {
      type: DataTypes.ENUM(...Object.values(PrayerPrivacyLevel)),
      allowNull: false,
      defaultValue: PrayerPrivacyLevel.PUBLIC,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PrayerStatus)),
      allowNull: false,
      defaultValue: PrayerStatus.ACTIVE,
    },
    prayerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    answeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'prayer_requests',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['created_at'] },
    ],
  }
);

export default PrayerRequest;
