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
  commentCount?: number;
  shareCount?: number;
  visibility?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes
  extends Optional<PostAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public id!: string;
  public authorId!: string;
  public communityId?: string;
  public content!: string;
  public mediaUrls?: string[];
  public postType?: string;
  public isPinned?: boolean;
  public likesCount?: number;
  public commentCount?: number;
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
      references: {
        model: 'users',
        key: 'id',
      },
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
      allowNull: true,
      field: 'post_type',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_pinned',
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'likes_count', // ✅ FIXED COLUMN NAME
    },
    commentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'comment_count',
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'share_count',
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'public',
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
    tableName: 'posts',
    timestamps: true,
    underscored: true,
  }
);

export default Post;
