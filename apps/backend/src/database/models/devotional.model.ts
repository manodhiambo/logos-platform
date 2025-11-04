import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.config';

export interface DevotionalAttributes {
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
}

class Devotional extends Model<DevotionalAttributes> implements DevotionalAttributes {
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
}

Devotional.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scriptureReference: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    publishedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    readingTimeMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'devotionals',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['published_date'] },
      { fields: ['author_id'] },
    ],
  }
);

export default Devotional;
