import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

interface GroupMessageAttributes {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupMessageCreationAttributes
  extends Optional<GroupMessageAttributes, 'id' | 'isDeleted' | 'createdAt' | 'updatedAt'> {}

class GroupMessage
  extends Model<GroupMessageAttributes, GroupMessageCreationAttributes>
  implements GroupMessageAttributes
{
  public id!: string;
  public groupId!: string;
  public senderId!: string;
  public content!: string;
  public attachmentUrl?: string;
  public attachmentType?: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id',
      references: {
        model: 'group_chats',
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachmentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'attachment_url',
    },
    attachmentType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'attachment_type',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted',
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
    tableName: 'group_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['group_id'] },
      { fields: ['sender_id'] },
      { fields: ['created_at'] },
    ],
  }
);

export default GroupMessage;
