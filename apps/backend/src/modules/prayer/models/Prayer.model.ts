import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PrayerAttributes {
  id: string;
  userId: string;
  prayerRequestId?: string;
  title: string;
  description: string;
  category: string;
  privacyLevel: string;
  status: string;
  prayerCount: number;
  isAnswered: boolean;
  answeredAt?: Date;
  testimonyText?: string;
  expiresAt?: Date;
  message?: string; // ✅ Added this field to fix TS2353
  createdAt?: Date;
  updatedAt?: Date;
}

interface PrayerCreationAttributes
  extends Optional<
    PrayerAttributes,
    | 'id'
    | 'prayerRequestId'
    | 'prayerCount'
    | 'isAnswered'
    | 'createdAt'
    | 'updatedAt'
    | 'message'
  > {}

class Prayer extends Model<PrayerAttributes, PrayerCreationAttributes>
  implements PrayerAttributes {
  public id!: string;
  public userId!: string;
  public prayerRequestId?: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public privacyLevel!: string;
  public status!: string;
  public prayerCount!: number;
  public isAnswered!: boolean;
  public answeredAt?: Date;
  public testimonyText?: string;
  public expiresAt?: Date;
  public message?: string; // ✅ Added this property
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prayer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    prayerRequestId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'prayer_request_id',
      references: {
        model: 'prayer_requests',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    privacyLevel: {
      type: DataTypes.STRING(20),
      defaultValue: 'public',
      field: 'privacy_level',
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
    },
    prayerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'prayer_count',
    },
    isAnswered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_answered',
    },
    answeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'answered_at',
    },
    testimonyText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'testimony_text',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    }, // ✅ Added this column
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
    tableName: 'prayer_requests',
    timestamps: true,
    underscored: true,
  }
);

export default Prayer;
