import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum GroupMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

interface GroupMemberAttributes {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt?: Date;
  createdAt?: Date;
}

interface GroupMemberCreationAttributes
  extends Optional<GroupMemberAttributes, 'id' | 'role' | 'createdAt'> {}

class GroupMember
  extends Model<GroupMemberAttributes, GroupMemberCreationAttributes>
  implements GroupMemberAttributes
{
  public id!: string;
  public groupId!: string;
  public userId!: string;
  public role!: GroupMemberRole;
  public joinedAt?: Date;

  public readonly createdAt!: Date;
}

GroupMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id',
      references: {
        model: 'group_chats',
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
      type: DataTypes.ENUM(...Object.values(GroupMemberRole)),
      allowNull: false,
      defaultValue: GroupMemberRole.MEMBER,
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'group_members',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['group_id'] },
      { fields: ['user_id'] },
      { unique: true, fields: ['group_id', 'user_id'] },
    ],
  }
);

export default GroupMember;
