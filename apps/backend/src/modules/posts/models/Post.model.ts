import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PostAttributes {
  id: string;
  userId: string;
  authorId?: string;
  communityId?: string;
  content: string;
  mediaUrls: any[];
  postType: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  visibility: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'mediaUrls' | 'isPinned' | 'likeCount' | 'commentCount' | 'shareCount' | 'isDeleted' | 'createdAt' | 'updatedAt'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public userId!: string;
  public authorId?: string;
  public communityId?: string;
  public content!: string;
  public mediaUrls!: any[];
  public postType!: string;
  public isPinned!: boolean;
  public likeCount!: number;
  public commentCount!: number;
  public shareCount!: number;
  public visibility!: string;
  public isDeleted!: boolean;
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
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
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'media_urls',
    },
    postType: {
      type: DataTypes.STRING(20),
      defaultValue: 'regular',
      field: 'post_type',
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_pinned',
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'like_count',
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
      type: DataTypes.STRING(20),
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
