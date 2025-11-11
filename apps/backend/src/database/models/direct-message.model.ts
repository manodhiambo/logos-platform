import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

interface DirectMessageAttributes {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  attachmentUrl?: string;
  attachmentType?: string;
  isDeleted: boolean;
  deletedBy?: string;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DirectMessageCreationAttributes
  extends Optional
    DirectMessageAttributes,
    'id' | 'status' | 'isDeleted' | 'createdAt' | 'updatedAt'
  > {}

class DirectMessage
  extends Model<DirectMessageAttributes, DirectMessageCreationAttributes>
  implements DirectMessageAttributes
{
  public id!: string;
  public senderId!: string;
  public receiverId!: string;
  public content!: string;
  public status!: MessageStatus;
  public attachmentUrl?: string;
  public attachmentType?: string;
  public isDeleted!: boolean;
  public deletedBy?: string;
  public readAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DirectMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'receiver_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MessageStatus)),
      allowNull: false,
      defaultValue: MessageStatus.SENT,
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
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'deleted_by',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
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
    tableName: 'direct_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['sender_id'] },
      { fields: ['receiver_id'] },
      { fields: ['created_at'] },
      { fields: ['sender_id', 'receiver_id'] },
    ],
  }
);

export default DirectMessage;
