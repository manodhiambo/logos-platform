import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface PrayerAttributes {
  id: string;
  prayerRequestId: string;
  userId: string;
  message?: string;
  prayedAt?: Date;
  createdAt?: Date;
}

class Prayer extends Model<PrayerAttributes> implements PrayerAttributes {
  public id!: string;
  public prayerRequestId!: string;
  public userId!: string;
  public message?: string;
  public prayedAt!: Date;

  public readonly createdAt!: Date;
}

Prayer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prayerRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'prayer_requests',
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
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prayedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'prayers',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['prayer_request_id'] },
      { fields: ['user_id'] },
      { fields: ['prayed_at'] },
    ],
  }
);

export default Prayer;
