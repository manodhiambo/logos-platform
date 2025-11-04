import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface CommentAttributes {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId?: string;
  content: string;
  likesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  public id!: string;
  public postId!: string;
  public authorId!: string;
  public parentCommentId?: string;
  public content!: string;
  public likesCount!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    parentCommentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['post_id'] },
      { fields: ['author_id'] },
      { fields: ['parent_comment_id'] },
    ],
  }
);

export default Comment;
