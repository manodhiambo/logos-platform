import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface NotificationPreferencesAttributes {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  prayerReminders: boolean;
  devotionalReminders: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
  communityNotifications: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationPreferencesCreationAttributes extends Optional<NotificationPreferencesAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class NotificationPreferences extends Model<NotificationPreferencesAttributes, NotificationPreferencesCreationAttributes> implements NotificationPreferencesAttributes {
  public id!: string;
  public userId!: string;
  public emailNotifications!: boolean;
  public pushNotifications!: boolean;
  public prayerReminders!: boolean;
  public devotionalReminders!: boolean;
  public commentNotifications!: boolean;
  public mentionNotifications!: boolean;
  public communityNotifications!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificationPreferences.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'email_notifications',
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'push_notifications',
    },
    prayerReminders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'prayer_reminders',
    },
    devotionalReminders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'devotional_reminders',
    },
    commentNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'comment_notifications',
    },
    mentionNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'mention_notifications',
    },
    communityNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'community_notifications',
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
    tableName: 'notification_preferences',
    timestamps: true,
    underscored: true,
  }
);

export default NotificationPreferences;
