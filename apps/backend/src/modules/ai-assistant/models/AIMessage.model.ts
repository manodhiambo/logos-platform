import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface AIMessageAttributes {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  bibleReferences: any[];
  metadata: any;
  createdAt?: Date;
}

interface AIMessageCreationAttributes extends Optional<AIMessageAttributes, 'id' | 'createdAt'> {}

class AIMessage extends Model<AIMessageAttributes, AIMessageCreationAttributes> implements AIMessageAttributes {
  public id!: string;
  public conversationId!: string;
  public role!: 'user' | 'assistant';
  public content!: string;
  public bibleReferences!: any[];
  public metadata!: any;
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
      field: 'conversation_id',
      references: {
        model: 'ai_conversations',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['user', 'assistant']],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bibleReferences: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'bible_references',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'ai_messages',
    timestamps: false,
    underscored: true,
  }
);

export default AIMessage;
