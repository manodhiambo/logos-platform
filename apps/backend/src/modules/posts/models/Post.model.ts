import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PostAttributes {
  id: string;
  authorId: string;
  communityId?: string;
  content: string;
  mediaUrls?: string[];
  postType?: string;
  isPinned?: boolean;
  likesCount?: number;
  commentsCount?: number;
  shareCount?: number;
  visibility?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public authorId!: string;
  public communityId?: string;
  public content!: string;
  public mediaUrls?: string[];
  public postType?: string;
  public isPinned?: boolean;
  public likesCount?: number;
  public commentsCount?: number;
  public shareCount?: number;
  public visibility?: string;
  public isDeleted?: boolean;
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
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'author_id',
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'community_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mediaUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      field: 'media_urls',
    },
    postType: {
      type: DataTypes.STRING,
      field: 'post_type',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      field: 'is_pinned',
      defaultValue: false,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      field: 'likes_count',
      defaultValue: 0,
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      field: 'comments_count',
      defaultValue: 0,
    },
    shareCount: {
      type: DataTypes.INTEGER,
      field: 'share_count',
      defaultValue: 0,
    },
    visibility: {
      type: DataTypes.STRING,
      defaultValue: 'public',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      field: 'is_deleted',
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: false,
    underscored: true,
  }
);

export default Post;
