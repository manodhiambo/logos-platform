import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface DevotionalAttributes {
  id: string;
  title: string;
  content: string;
  scriptureReference: string;
  authorId?: string;
  publishedDate: Date;
  readingTimeMinutes: number;
  viewsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  isPublished: boolean;
}

interface DevotionalCreationAttributes extends Optional<DevotionalAttributes, 'id' | 'viewsCount' | 'isPublished' | 'createdAt' | 'updatedAt'> {}

class Devotional extends Model<DevotionalAttributes, DevotionalCreationAttributes> implements DevotionalAttributes {
  public id!: string;
  public title!: string;
  public content!: string;
  public scriptureReference!: string;
  public authorId?: string;
  public publishedDate!: Date;
  public readingTimeMinutes!: number;
  public viewsCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public isPublished!: boolean;
}

Devotional.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scriptureReference: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'scripture_reference',
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'author_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    publishedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'published_date',
    },
    readingTimeMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'reading_time_minutes',
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'views_count',
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
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_published',
    },
  },
  {
    sequelize,
    tableName: 'devotionals',
    timestamps: true,
    underscored: true,
  }
);

export default Devotional;
