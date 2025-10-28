import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

export enum ParticipantRole {
  HOST = 'host',
  CO_HOST = 'co_host',
  PARTICIPANT = 'participant',
}

interface CallParticipantAttributes {
  id: string;
  callId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt?: Date;
  leftAt?: Date;
  duration?: number; // in seconds
  isMuted: boolean;
  isVideoOff: boolean;
  metadata?: any;
  createdAt?: Date;
}

interface CallParticipantCreationAttributes
  extends Optional<CallParticipantAttributes, 'id' | 'createdAt'> {}

class CallParticipant
  extends Model<CallParticipantAttributes, CallParticipantCreationAttributes>
  implements CallParticipantAttributes
{
  public id!: string;
  public callId!: string;
  public userId!: string;
  public role!: ParticipantRole;
  public joinedAt?: Date;
  public leftAt?: Date;
  public duration?: number;
  public isMuted!: boolean;
  public isVideoOff!: boolean;
  public metadata?: any;

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
      references: {
        model: 'video_calls',
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
      type: DataTypes.ENUM(...Object.values(ParticipantRole)),
      allowNull: false,
      defaultValue: ParticipantRole.PARTICIPANT,
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
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isMuted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_muted',
    },
    isVideoOff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_video_off',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'call_participants',
    timestamps: false,
    underscored: true,
  }
);

export default CallParticipant;
