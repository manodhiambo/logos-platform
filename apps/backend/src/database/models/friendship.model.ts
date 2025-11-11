import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

interface FriendshipAttributes {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FriendshipCreationAttributes
  extends Optional<FriendshipAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Friendship
  extends Model<FriendshipAttributes, FriendshipCreationAttributes>
  implements FriendshipAttributes
{
  public id!: string;
  public requesterId!: string;
  public addresseeId!: string;
  public status!: FriendshipStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Friendship.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'requester_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    addresseeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'addressee_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(FriendshipStatus)),
      allowNull: false,
      defaultValue: FriendshipStatus.PENDING,
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
    tableName: 'friendships',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['requester_id'] },
      { fields: ['addressee_id'] },
      { unique: true, fields: ['requester_id', 'addressee_id'] },
    ],
  }
);

export default Friendship;
