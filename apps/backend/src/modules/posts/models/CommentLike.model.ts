import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface CommentLikeAttributes {
  id: string;
  commentId: string;
  userId: string;
  createdAt?: Date;
}

interface CommentLikeCreationAttributes extends Optional<CommentLikeAttributes, 'id' | 'createdAt'> {}

class CommentLike extends Model<CommentLikeAttributes, CommentLikeCreationAttributes> implements CommentLikeAttributes {
  public id!: string;
  public commentId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
}

CommentLike.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'comment_id',
      references: {
        model: 'comments',
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'comment_likes',
    timestamps: false,
    underscored: true,
  }
);

export default CommentLike;
