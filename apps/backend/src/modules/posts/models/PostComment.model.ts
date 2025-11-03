import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PostCommentAttributes {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCommentCreationAttributes extends Optional<PostCommentAttributes, 'id' | 'likeCount' | 'isDeleted' | 'createdAt' | 'updatedAt'> {}

class PostComment extends Model<PostCommentAttributes, PostCommentCreationAttributes> implements PostCommentAttributes {
  public id!: string;
  public postId!: string;
  public userId!: string;
  public content!: string;
  public parentCommentId?: string;
  public likeCount!: number;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PostComment.init(
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
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parentCommentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_comment_id',
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_deleted',
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
    tableName: 'post_comments',
    timestamps: true,
    underscored: true,
  }
);

export default PostComment;
