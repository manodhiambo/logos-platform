import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/database.config';

interface BibleVerseAttributes {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  text: string;
  createdAt?: Date;
}

interface BibleVerseCreationAttributes extends Optional<BibleVerseAttributes, 'id' | 'createdAt'> {}

class BibleVerse extends Model<BibleVerseAttributes, BibleVerseCreationAttributes> implements BibleVerseAttributes {
  public id!: number;
  public book!: string;
  public chapter!: number;
  public verse!: number;
  public translation!: string;
  public text!: string;
  public readonly createdAt!: Date;
}

BibleVerse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    book: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    verse: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    translation: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    text: {
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
    tableName: 'bible_verses',
    timestamps: false,
    underscored: true,
  }
);

export default BibleVerse;
