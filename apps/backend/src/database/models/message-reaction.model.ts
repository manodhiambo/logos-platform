import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

interface MessageReactionAttributes {
  id: string;
  messageId: string;
  userId: string;
  reaction: string; // emoji or reaction type
  createdAt?: Date;
}

interface MessageReactionCreationAttributes
  extends Optional<MessageReactionAttributes, 'id' | 'createdAt'> {}

class MessageReaction
  extends Model<MessageReactionAttributes, MessageReactionCreationAttributes>
  implements MessageReactionAttributes
{
  public id!: string;
  public messageId!: string;
  public userId!: string;
  public reaction!: string;

  public readonly createdAt!: Date;
}

MessageReaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'message_id',
      references: {
        model: 'direct_messages',
        key: 'id',
      },
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
    reaction: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'message_reactions',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['message_id'] },
      { fields: ['user_id'] },
      { unique: true, fields: ['message_id', 'user_id', 'reaction'] },
    ],
  }
);

export default MessageReaction;
