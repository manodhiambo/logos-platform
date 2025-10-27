import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface BibleTranslationAttributes {
  id: number;
  code: string;
  name: string;
  language: string;
  year?: number;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
}

interface BibleTranslationCreationAttributes extends Optional<BibleTranslationAttributes, 'id' | 'isActive' | 'createdAt'> {}

class BibleTranslation extends Model<BibleTranslationAttributes, BibleTranslationCreationAttributes> implements BibleTranslationAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public language!: string;
  public year?: number;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
}

BibleTranslation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'bible_translations',
    timestamps: false,
    underscored: true,
  }
);

export default BibleTranslation;
