import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PrayerAttributes {
  id: string;
  prayerRequestId: string;
  userId: string;
  message?: string;
  prayedAt?: Date;
}

interface PrayerCreationAttributes extends Optional<PrayerAttributes, 'id' | 'prayedAt'> {}

class Prayer extends Model<PrayerAttributes, PrayerCreationAttributes> implements PrayerAttributes {
  public id!: string;
  public prayerRequestId!: string;
  public userId!: string;
  public message?: string;
  public readonly prayedAt!: Date;
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
      field: 'prayer_request_id',
      references: {
        model: 'prayer_requests',
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
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prayedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'prayed_at',
    },
  },
  {
    sequelize,
    tableName: 'prayers',
    timestamps: false,
    underscored: true,
  }
);

export default Prayer;
