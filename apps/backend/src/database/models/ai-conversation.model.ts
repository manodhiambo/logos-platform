import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface AIConversationAttributes {
  id: string;
  userId: string;
  title: string;
  conversationContext?: any;
  poeConversationId?: string;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class AIConversation extends Model<AIConversationAttributes> implements AIConversationAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public conversationContext?: any;
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
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'New Conversation',
    },
    conversationContext: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    poeConversationId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'ai_conversations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['is_archived'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AIConversation;
