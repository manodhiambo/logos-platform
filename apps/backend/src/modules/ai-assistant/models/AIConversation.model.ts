import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface AIConversationAttributes {
  id: string;
  userId: string;
  title?: string;
  conversationContext: any;
  poeConversationId?: string;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AIConversationCreationAttributes extends Optional<AIConversationAttributes, 'id' | 'isArchived' | 'createdAt' | 'updatedAt'> {}

class AIConversation extends Model<AIConversationAttributes, AIConversationCreationAttributes> implements AIConversationAttributes {
  public id!: string;
  public userId!: string;
  public title?: string;
  public conversationContext!: any;
  public poeConversationId?: string;
  public isArchived!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIConversation.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    conversationContext: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'conversation_context',
    },
    poeConversationId: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'poe_conversation_id',
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_archived',
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
    tableName: 'ai_conversations',
    timestamps: true,
    underscored: true,
  }
);

export default AIConversation;
