import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum MemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export interface CommunityMemberAttributes {
  id: string;
  communityId: string;
  userId: string;
  role: MemberRole;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class CommunityMember extends Model<CommunityMemberAttributes> implements CommunityMemberAttributes {
  public id!: string;
  public communityId!: string;
  public userId!: string;
  public role!: MemberRole;
  public joinedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      references: {
        model: 'communities',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(MemberRole)),
      allowNull: false,
      defaultValue: MemberRole.MEMBER,
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'community_members',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['community_id'] },
      { fields: ['user_id'] },
      { unique: true, fields: ['community_id', 'user_id'] },
    ],
  }
);

export default CommunityMember;
