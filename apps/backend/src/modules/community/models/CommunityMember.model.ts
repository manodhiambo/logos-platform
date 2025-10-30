import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface CommunityMemberAttributes {
  id: string;
  communityId: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt?: Date;
}

interface CommunityMemberCreationAttributes extends Optional<CommunityMemberAttributes, 'id' | 'role' | 'joinedAt'> {}

class CommunityMember extends Model<CommunityMemberAttributes, CommunityMemberCreationAttributes> implements CommunityMemberAttributes {
  public id!: string;
  public communityId!: string;
  public userId!: string;
  public role!: 'owner' | 'admin' | 'moderator' | 'member';
  public readonly joinedAt!: Date;
}

CommunityMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'community_id',
      references: {
        model: 'communities',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'moderator', 'member'),
      defaultValue: 'member',
      allowNull: false,
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at',
    },
  },
  {
    sequelize,
    tableName: 'community_members',
    timestamps: false,
    underscored: true,
  }
);

export default CommunityMember;
