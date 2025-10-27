import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PrayerRequestAttributes {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'personal' | 'family' | 'health' | 'guidance' | 'thanksgiving' | 'other';
  privacyLevel: 'public' | 'community' | 'private';
  status: 'active' | 'answered' | 'ongoing';
  prayerCount: number;
  testimony?: string;
  answeredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted: boolean;
}

interface PrayerRequestCreationAttributes extends Optional<PrayerRequestAttributes, 'id' | 'prayerCount' | 'isDeleted' | 'createdAt' | 'updatedAt'> {}

class PrayerRequest extends Model<PrayerRequestAttributes, PrayerRequestCreationAttributes> implements PrayerRequestAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public category!: 'personal' | 'family' | 'health' | 'guidance' | 'thanksgiving' | 'other';
  public privacyLevel!: 'public' | 'community' | 'private';
  public status!: 'active' | 'answered' | 'ongoing';
  public prayerCount!: number;
  public testimony?: string;
  public answeredAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public isDeleted!: boolean;
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
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('personal', 'family', 'health', 'guidance', 'thanksgiving', 'other'),
      allowNull: false,
    },
    privacyLevel: {
      type: DataTypes.ENUM('public', 'community', 'private'),
      defaultValue: 'public',
      field: 'privacy_level',
    },
    status: {
      type: DataTypes.ENUM('active', 'answered', 'ongoing'),
      defaultValue: 'active',
    },
    prayerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'prayer_count',
    },
    testimony: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    answeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'answered_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted',
    },
  },
  {
    sequelize,
    tableName: 'prayer_requests',
    timestamps: true,
    underscored: true,
  }
);

export default PrayerRequest;
