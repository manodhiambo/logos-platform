import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PostLikeAttributes {
  id: string;
  postId: string;
  userId: string;
  createdAt?: Date;
}

interface PostLikeCreationAttributes extends Optional<PostLikeAttributes, 'id' | 'createdAt'> {}

class PostLike extends Model<PostLikeAttributes, PostLikeCreationAttributes> implements PostLikeAttributes {
  public id!: string;
  public postId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
}

PostLike.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'post_id',
      references: {
        model: 'posts',
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
    tableName: 'post_likes',
    timestamps: false,
    underscored: true,
  }
);

export default PostLike;

// Import models for associations
import User from '../../../database/models/user.model';
import Post from './Post.model';

// Define associations
PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PostLike.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
