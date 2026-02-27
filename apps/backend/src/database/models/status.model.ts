import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.config';

interface StatusAttributes {
  id: string;
  userId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundColor?: string;
  textColor?: string;
  viewsCount?: number;
  expiresAt: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StatusCreationAttributes extends Optional<StatusAttributes, 'id' | 'viewsCount' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Status extends Model<StatusAttributes, StatusCreationAttributes> implements StatusAttributes {
  public id!: string;
  public userId!: string;
  public content?: string;
  public mediaUrl?: string;
  public mediaType?: 'image' | 'video';
  public backgroundColor?: string;
  public textColor?: string;
  public viewsCount?: number;
  public expiresAt!: Date;
  public isActive?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Status.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mediaUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: 'media_url',
    },
    mediaType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: true,
      field: 'media_type',
    },
    backgroundColor: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#667eea',
      field: 'background_color',
    },
    textColor: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#ffffff',
      field: 'text_color',
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'views_count',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'statuses',
    timestamps: true,
    underscored: true,
  }
);

export default Status;
