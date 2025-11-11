import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

interface FollowAttributes {
  id: string;
  followerId: string;
  followingId: string;
  createdAt?: Date;
}

interface FollowCreationAttributes
  extends Optional<FollowAttributes, 'id' | 'createdAt'> {}

class Follow
  extends Model<FollowAttributes, FollowCreationAttributes>
  implements FollowAttributes
{
  public id!: string;
  public followerId!: string;
  public followingId!: string;

  public readonly createdAt!: Date;
}

Follow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'follower_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'following_id',
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
    tableName: 'follows',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['follower_id'] },
      { fields: ['following_id'] },
      { unique: true, fields: ['follower_id', 'following_id'] },
    ],
  }
);

export default Follow;
