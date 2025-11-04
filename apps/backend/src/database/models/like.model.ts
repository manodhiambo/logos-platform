import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface LikeAttributes {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt?: Date;
}

class Like extends Model<LikeAttributes> implements LikeAttributes {
  public id!: string;
  public userId!: string;
  public postId?: string;
  public commentId?: string;

  public readonly createdAt!: Date;
}

Like.init(
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
    postId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'likes',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['post_id'] },
      { fields: ['comment_id'] },
    ],
  }
);

export default Like;
