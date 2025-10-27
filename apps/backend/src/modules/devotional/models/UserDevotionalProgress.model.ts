import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface UserDevotionalProgressAttributes {
  id: string;
  userId: string;
  devotionalId: string;
  completed: boolean;
  notes?: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserDevotionalProgressCreationAttributes extends Optional<UserDevotionalProgressAttributes, 'id' | 'completed' | 'createdAt' | 'updatedAt'> {}

class UserDevotionalProgress extends Model<UserDevotionalProgressAttributes, UserDevotionalProgressCreationAttributes> implements UserDevotionalProgressAttributes {
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
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    devotionalId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'devotional_id',
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
      field: 'completed_at',
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
    tableName: 'user_devotional_progress',
    timestamps: true,
    underscored: true,
  }
);

export default UserDevotionalProgress;
