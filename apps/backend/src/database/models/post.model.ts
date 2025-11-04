import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum PostType {
  DISCUSSION = 'discussion',
  PRAYER_REQUEST = 'prayer_request',
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
      references: {
        model: 'communities',
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    postType: {
      type: DataTypes.ENUM(...Object.values(PostType)),
      allowNull: false,
      defaultValue: PostType.DISCUSSION,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['community_id'] },
      { fields: ['author_id'] },
      { fields: ['created_at'] },
    ],
  }
);

export default Post;
