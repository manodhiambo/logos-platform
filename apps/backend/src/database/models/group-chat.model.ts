import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

interface GroupChatAttributes {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupChatCreationAttributes
  extends Optional<GroupChatAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class GroupChat
  extends Model<GroupChatAttributes, GroupChatCreationAttributes>
  implements GroupChatAttributes
{
  public id!: string;
  public name!: string;
  public description?: string;
  public avatarUrl?: string;
  public createdBy!: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupChat.init(
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
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'avatar_url',
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
    tableName: 'group_chats',
    timestamps: true,
    underscored: true,
  }
);

export default GroupChat;
