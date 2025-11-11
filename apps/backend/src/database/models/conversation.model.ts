import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

interface ConversationAttributes {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCountUser1: number;
  unreadCountUser2: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'unreadCountUser1' | 'unreadCountUser2' | 'createdAt' | 'updatedAt'> {}

class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: string;
  public participant1Id!: string;
  public participant2Id!: string;
  public lastMessageAt?: Date;
  public lastMessagePreview?: string;
  public unreadCountUser1!: number;
  public unreadCountUser2!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    participant1Id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'participant1_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    participant2Id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'participant2_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_message_at',
    },
    lastMessagePreview: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'last_message_preview',
    },
    unreadCountUser1: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'unread_count_user1',
    },
    unreadCountUser2: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'unread_count_user2',
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
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['participant1_id'] },
      { fields: ['participant2_id'] },
      { unique: true, fields: ['participant1_id', 'participant2_id'] },
      { fields: ['last_message_at'] },
    ],
  }
);

export default Conversation;
