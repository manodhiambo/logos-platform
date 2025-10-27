import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface NotificationAttributes {
  id: string;
  userId: string;
  type: 'prayer_support' | 'comment' | 'reply' | 'mention' | 'community_invite' | 'devotional_reminder' | 'post_like' | 'comment_like' | 'new_post' | 'prayer_answered';
  title: string;
  message: string;
  linkUrl?: string;
  metadata: any;
  isRead: boolean;
  createdAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead' | 'metadata' | 'createdAt'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public userId!: string;
  public type!: 'prayer_support' | 'comment' | 'reply' | 'mention' | 'community_invite' | 'devotional_reminder' | 'post_like' | 'comment_like' | 'new_post' | 'prayer_answered';
  public title!: string;
  public message!: string;
  public linkUrl?: string;
  public metadata!: any;
  public isRead!: boolean;
  public readonly createdAt!: Date;
}

Notification.init(
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
    type: {
      type: DataTypes.ENUM(
        'prayer_support',
        'comment',
        'reply',
        'mention',
        'community_invite',
        'devotional_reminder',
        'post_like',
        'comment_like',
        'new_post',
        'prayer_answered'
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    linkUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'link_url',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: false,
    underscored: true,
  }
);

export default Notification;
