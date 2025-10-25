import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum AnnouncementType {
  GENERAL = 'general',
  MAINTENANCE = 'maintenance',
  FEATURE = 'feature',
  EVENT = 'event',
  URGENT = 'urgent',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface AnnouncementAttributes {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  authorId: string;
  priority: number;
  targetCommunityId?: string;
  isGlobal: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnnouncementCreationAttributes
  extends Optional
    AnnouncementAttributes,
    | 'id'
    | 'status'
    | 'priority'
    | 'targetCommunityId'
    | 'isGlobal'
    | 'publishedAt'
    | 'expiresAt'
    | 'viewCount'
    | 'createdAt'
    | 'updatedAt'
  > {}

class Announcement
  extends Model<AnnouncementAttributes, AnnouncementCreationAttributes>
  implements AnnouncementAttributes
{
  public id!: string;
  public title!: string;
  public content!: string;
  public type!: AnnouncementType;
  public status!: AnnouncementStatus;
  public authorId!: string;
  public priority!: number;
  public targetCommunityId?: string;
  public isGlobal!: boolean;
  public publishedAt?: Date;
  public expiresAt?: Date;
  public viewCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public isActive(): boolean {
    if (this.status !== AnnouncementStatus.PUBLISHED) return false;
    if (!this.publishedAt) return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
  }

  public isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }
}

Announcement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 200],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(AnnouncementType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AnnouncementStatus)),
      defaultValue: AnnouncementStatus.DRAFT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    targetCommunityId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'announcements',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['is_global'] },
      { fields: ['published_at'] },
      { fields: ['author_id'] },
    ],
  }
);

export default Announcement;

// Set up associations
import User from './user.model';

Announcement.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});
