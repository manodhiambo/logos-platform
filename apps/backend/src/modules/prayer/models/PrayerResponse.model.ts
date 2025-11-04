import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface PrayerResponseAttributes {
  id: string;
  prayerRequestId: string;
  userId: string;
  message: string;
  createdAt?: Date;
}

interface PrayerResponseCreationAttributes extends Optional<PrayerResponseAttributes, 'id' | 'createdAt'> {}

class PrayerResponse extends Model<PrayerResponseAttributes, PrayerResponseCreationAttributes> implements PrayerResponseAttributes {
  public id!: string;
  public prayerRequestId!: string;
  public userId!: string;
  public message!: string;
  public readonly createdAt!: Date;
}

PrayerResponse.init(
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
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'prayer_responses',
    timestamps: false,
  }
);

export default PrayerResponse;
