import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface CallParticipantAttributes {
  id: string;
  callId: string;
  userId: string;
  joinedAt?: Date;
  leftAt?: Date;
  createdAt?: Date;
}

class CallParticipant extends Model<CallParticipantAttributes> implements CallParticipantAttributes {
  public id!: string;
  public callId!: string;
  public userId!: string;
  public joinedAt?: Date;
  public leftAt?: Date;
  public readonly createdAt!: Date;
}

CallParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    callId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'call_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'joined_at',
    },
    leftAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'left_at',
    },
  },
  {
    sequelize,
    tableName: 'call_participants',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

export default CallParticipant;
