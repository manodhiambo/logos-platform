import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum CommunityCategory {
  BIBLE_STUDY = 'bible_study',
  PRAYER_GROUP = 'prayer_group',
  DISCIPLESHIP = 'discipleship',
  YOUTH = 'youth',
  GENERAL = 'general',
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
}

export interface CommunityAttributes {
  id: string;
  name: string;
  description?: string;
  category: CommunityCategory;
  privacyLevel: PrivacyLevel;
  createdBy: string;
  memberCount: number;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Community extends Model<CommunityAttributes> implements CommunityAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public category!: CommunityCategory;
  public privacyLevel!: PrivacyLevel;
  public createdBy!: string;
  public memberCount!: number;
  public avatarUrl?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Community.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(CommunityCategory)),
      allowNull: false,
      defaultValue: CommunityCategory.GENERAL,
    },
    privacyLevel: {
      type: DataTypes.ENUM(...Object.values(PrivacyLevel)),
      allowNull: false,
      defaultValue: PrivacyLevel.PUBLIC,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    memberCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'communities',
    timestamps: true,
    underscored: true,
  }
);

export default Community;
