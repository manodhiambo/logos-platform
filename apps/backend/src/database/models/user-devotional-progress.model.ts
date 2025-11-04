import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface UserDevotionalProgressAttributes {
  id: string;
  userId: string;
  devotionalId: string;
  completed: boolean;
  notes?: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class UserDevotionalProgress extends Model<UserDevotionalProgressAttributes> implements UserDevotionalProgressAttributes {
  public id!: string;
  public userId!: string;
  public devotionalId!: string;
  public completed!: boolean;
  public notes?: string;
  public completedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserDevotionalProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    devotionalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'devotionals',
        key: 'id',
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_devotional_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['devotional_id'] },
      { unique: true, fields: ['user_id', 'devotional_id'] },
    ],
  }
);

export default UserDevotionalProgress;
