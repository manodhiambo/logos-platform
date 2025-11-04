import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface AIMessageAttributes {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  bibleReferences?: any;
  metadata?: any;
  createdAt?: Date;
}

class AIMessage extends Model<AIMessageAttributes> implements AIMessageAttributes {
  public id!: string;
  public conversationId!: string;
  public role!: MessageRole;
  public content!: string;
  public bibleReferences?: any;
  public metadata?: any;

  public readonly createdAt!: Date;
}

AIMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ai_conversations',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(MessageRole)),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bibleReferences: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'ai_messages',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['conversation_id'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AIMessage;
