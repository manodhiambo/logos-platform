import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum PostType {
  DISCUSSION = 'discussion',
  ANNOUNCEMENT = 'announcement',
  PRAYER = 'prayer',
  TESTIMONY = 'testimony',
  QUESTION = 'question',
}

export interface PostAttributes {
  id: string;
  communityId?: string;
  authorId: string;
  content: string;
  postType: PostType;
  attachments?: any;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Post extends Model<PostAttributes> implements PostAttributes {
  public id!: string;
  public communityId?: string;
  public authorId!: string;
  public content!: string;
  public postType!: PostType;
  public attachments?: any;
  public isPinned!: boolean;
  public likesCount!: number;
  public commentsCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'community_id',
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'author_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    postType: {
      type: DataTypes.ENUM(...Object.values(PostType)),
      allowNull: false,
      defaultValue: PostType.DISCUSSION,
      field: 'post_type',
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_pinned',
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'likes_count',
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'comments_count',
    },
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: true,
    underscored: true,
  }
);

export default Post;
