import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

export enum CallType {
  ONE_ON_ONE = 'one_on_one',
  GROUP = 'group',
}

export enum CallStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum CallPurpose {
  PRAYER = 'prayer',
  BIBLE_STUDY = 'bible_study',
  COUNSELING = 'counseling',
  COMMUNITY = 'community',
  MENTORSHIP = 'mentorship',
  GENERAL = 'general',
}

interface VideoCallAttributes {
  id: string;
  channelName: string;
  hostId: string;
  type: CallType;
  purpose: CallPurpose;
  status: CallStatus;
  title: string;
  description?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  maxParticipants: number;
  isRecording: boolean;
  recordingUrl?: string;
  relatedTo?: string; // ID of community, prayer, etc.
  relatedType?: string; // 'community', 'prayer', 'post'
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VideoCallCreationAttributes
  extends Optional<VideoCallAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class VideoCall
  extends Model<VideoCallAttributes, VideoCallCreationAttributes>
  implements VideoCallAttributes
{
  public id!: string;
  public channelName!: string;
  public hostId!: string;
  public type!: CallType;
  public purpose!: CallPurpose;
  public status!: CallStatus;
  public title!: string;
  public description?: string;
  public scheduledAt?: Date;
  public startedAt?: Date;
  public endedAt?: Date;
  public maxParticipants!: number;
  public isRecording!: boolean;
  public recordingUrl?: string;
  public relatedTo?: string;
  public relatedType?: string;
  public metadata?: any;

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
    channelName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'channel_name',
    },
    hostId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'host_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(CallType)),
      allowNull: false,
      defaultValue: CallType.GROUP,
    },
    purpose: {
      type: DataTypes.ENUM(...Object.values(CallPurpose)),
      allowNull: false,
      defaultValue: CallPurpose.GENERAL,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CallStatus)),
      allowNull: false,
      defaultValue: CallStatus.SCHEDULED,
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
      allowNull: true,
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
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      field: 'max_participants',
    },
    isRecording: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_recording',
    },
    recordingUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'recording_url',
    },
    relatedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'related_to',
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'related_type',
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
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
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
