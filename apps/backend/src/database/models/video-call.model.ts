import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export enum CallStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export interface VideoCallAttributes {
  id: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: CallStatus;
  meetingLink?: string;
  createdBy: string;
  communityId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class VideoCall extends Model<VideoCallAttributes> implements VideoCallAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public scheduledAt!: Date;
  public startedAt?: Date;
  public endedAt?: Date;
  public status!: CallStatus;
  public meetingLink?: string;
  public createdBy!: string;
  public communityId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VideoCall.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'scheduled_at',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ended_at',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CallStatus)),
      defaultValue: CallStatus.SCHEDULED,
      allowNull: false,
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'meeting_link',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'community_id',
    },
  },
  {
    sequelize,
    tableName: 'video_calls',
    timestamps: true,
    underscored: true,
  }
);

export default VideoCall;
