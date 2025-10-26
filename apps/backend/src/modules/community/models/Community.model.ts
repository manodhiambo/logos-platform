import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface CommunityAttributes {
  id: string;
  name: string;
  description?: string;
  category: 'bible_study' | 'prayer_group' | 'discipleship' | 'youth' | 'general';
  privacyLevel: 'public' | 'private' | 'invite_only';
  avatarUrl?: string;
  coverImageUrl?: string;
  createdBy: string;
  memberCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommunityCreationAttributes extends Optional<CommunityAttributes, 'id' | 'memberCount' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Community extends Model<CommunityAttributes, CommunityCreationAttributes> implements CommunityAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public category!: 'bible_study' | 'prayer_group' | 'discipleship' | 'youth' | 'general';
  public privacyLevel!: 'public' | 'private' | 'invite_only';
  public avatarUrl?: string;
  public coverImageUrl?: string;
  public createdBy!: string;
  public memberCount!: number;
  public isActive!: boolean;
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('bible_study', 'prayer_group', 'discipleship', 'youth', 'general'),
      allowNull: false,
    },
    privacyLevel: {
      type: DataTypes.ENUM('public', 'private', 'invite_only'),
      defaultValue: 'public',
      field: 'privacy_level',
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'avatar_url',
    },
    coverImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cover_image_url',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    memberCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'member_count',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
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
  },
  {
    sequelize,
    tableName: 'communities',
    timestamps: true,
    underscored: true,
  }
);

export default Community;
