import axios from 'axios';
import BibleVerse from '../models/BibleVerse.model';
import BibleTranslation from '../models/BibleTranslation.model';
import { Op } from 'sequelize';
import { logger } from '../../../shared/utils/logger.util';

// Using Bible API: https://bible-api.com/
class BibleService {
  private bibleApiBase = 'https://bible-api.com';

  /**
   * Map translation codes to API-supported versions
   */
  private mapTranslation(translation: string): string {
    const translationMap: any = {
      'nkjv': 'kjv', // Bible API doesn't have NKJV, use KJV as fallback
      'niv': 'web',  // Use WEB as fallback for NIV
      'esv': 'web',  // Use WEB as fallback for ESV
      'nlt': 'web',  // Use WEB as fallback for NLT
    };

    return translationMap[translation.toLowerCase()] || translation.toLowerCase();
  }

  /**
   * Search Bible verses by keyword
   */
  async searchVerses(query: string, translation: string = 'nkjv', page: number = 1, limit: number = 20) {
    try {
      // Try to search in local database first
      const offset = (page - 1) * limit;
      
      const { rows: verses, count: total } = await BibleVerse.findAndCountAll({
        where: {
          translation: translation.toUpperCase(),
          text: {
            [Op.iLike]: `%${query}%`,
          },
        },
        limit,
        offset,
        order: [['book', 'ASC'], ['chapter', 'ASC'], ['verse', 'ASC']],
      });

      if (verses.length > 0) {
        return {
          results: verses.map(v => ({
            id: v.id,
            book: v.book,
            chapter: v.chapter,
            verse: v.verse,
            translation: v.translation,
            text: v.text,
            reference: `${v.book} ${v.chapter}:${v.verse}`,
          })),
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            limit,
          },
        };
      }

      // If not found in DB, return empty results
      return {
        results: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalResults: 0,
          limit,
        },
      };
    } catch (error: any) {
      logger.error('Bible search error:', error.message);
      throw new Error('Failed to search Bible verses');
    }
  }

  /**
   * Get specific verse
   */
  async getVerse(book: string, chapter: number, verse: number, translation: string = 'nkjv') {
    try {
      // Try from database first
      let verseData = await BibleVerse.findOne({
        where: {
          book: { [Op.iLike]: book },
          chapter,
          verse,
          translation: translation.toUpperCase(),
        },
      });

      if (verseData) {
        return {
          id: verseData.id,
          book: verseData.book,
          chapter: verseData.chapter,
          verse: verseData.verse,
          translation: verseData.translation,
          text: verseData.text,
          reference: `${verseData.book} ${verseData.chapter}:${verseData.verse}`,
        };
      }

      // If not in database, fetch from API
      const apiTranslation = this.mapTranslation(translation);
      
      logger.info(`Fetching verse from API: ${book} ${chapter}:${verse} (${apiTranslation})`);
      
      const response = await axios.get(
        `${this.bibleApiBase}/${encodeURIComponent(book)}+${chapter}:${verse}?translation=${apiTranslation}`,
        { timeout: 10000 }
      );

      const apiData = response.data;
      
      if (!apiData || !apiData.verses || apiData.verses.length === 0) {
        throw new Error('No verse data returned from API');
      }
      
      // Cache in database for future use
      verseData = await BibleVerse.create({
        book: apiData.verses[0].book_name,
        chapter: apiData.verses[0].chapter,
        verse: apiData.verses[0].verse,
        translation: translation.toUpperCase(),
        text: apiData.verses[0].text,
      });

      return {
        id: verseData.id,
        book: verseData.book,
        chapter: verseData.chapter,
        verse: verseData.verse,
        translation: verseData.translation,
        text: verseData.text,
        reference: `${verseData.book} ${verseData.chapter}:${verseData.verse}`,
      };
    } catch (error: any) {
      logger.error('Get verse error:', error.message);
      throw new Error(`Failed to retrieve Bible verse: ${error.message}`);
    }
  }

  /**
   * Get Bible passage (range of verses)
   */
  async getPassage(
    book: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
    translation: string = 'nkjv'
  ) {
    try {
      const apiTranslation = this.mapTranslation(translation);
      
      // Fetch from API
      const response = await axios.get(
        `${this.bibleApiBase}/${encodeURIComponent(book)}+${chapter}:${verseStart}-${verseEnd}?translation=${apiTranslation}`,
        { timeout: 10000 }
      );

      const apiData = response.data;

      if (!apiData || !apiData.verses || apiData.verses.length === 0) {
        throw new Error('No passage data returned from API');
      }

      return {
        book: apiData.verses[0].book_name,
        chapter,
        verseStart,
        verseEnd,
        translation: translation.toUpperCase(),
        verses: apiData.verses.map((v: any) => ({
          verse: v.verse,
          text: v.text,
        })),
        reference: apiData.reference,
      };
    } catch (error: any) {
      logger.error('Get passage error:', error.message);
      throw new Error(`Failed to retrieve Bible passage: ${error.message}`);
    }
  }

  /**
   * Get daily verse
   */
  async getDailyVerse(translation: string = 'nkjv') {
    try {
      // Array of inspiring verses
      const dailyVerses = [
        { book: 'John', chapter: 3, verse: 16 },
        { book: 'Proverbs', chapter: 3, verse: 5 },
        { book: 'Philippians', chapter: 4, verse: 13 },
        { book: 'Psalm', chapter: 23, verse: 1 },
        { book: 'Romans', chapter: 8, verse: 28 },
        { book: 'Matthew', chapter: 28, verse: 20 },
        { book: 'Isaiah', chapter: 40, verse: 31 },
        { book: 'Jeremiah', chapter: 29, verse: 11 },
        { book: '2Timothy', chapter: 1, verse: 7 },
        { book: 'Joshua', chapter: 1, verse: 9 },
      ];

      // Select verse based on day of year
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const selectedVerse = dailyVerses[dayOfYear % dailyVerses.length];

      const verse = await this.getVerse(
        selectedVerse.book,
        selectedVerse.chapter,
        selectedVerse.verse,
        translation
      );

      return {
        verse,
        date: new Date().toISOString().split('T')[0],
        reflection: this.getReflection(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse),
      };
    } catch (error: any) {
      logger.error('Get daily verse error:', error.message);
      throw new Error(`Failed to get daily verse: ${error.message}`);
    }
  }

  /**
   * Get available translations
   */
  async getTranslations() {
    const translations = await BibleTranslation.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    return translations;
  }

  /**
   * Get books of the Bible
   */
  getBibleBooks() {
    return {
      oldTestament: [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1Samuel', '2Samuel',
        '1Kings', '2Kings', '1Chronicles', '2Chronicles',
        'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
        'Ecclesiastes', 'SongofSolomon', 'Isaiah', 'Jeremiah',
        'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
        'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
        'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
      ],
      newTestament: [
        'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
        '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians',
        'Philippians', 'Colossians', '1Thessalonians', '2Thessalonians',
        '1Timothy', '2Timothy', 'Titus', 'Philemon', 'Hebrews',
        'James', '1Peter', '2Peter', '1John', '2John', '3John',
        'Jude', 'Revelation',
      ],
    };
  }

  /**
   * Simple reflection generator
   */
  private getReflection(book: string, chapter: number, verse: number): string {
    const reflections: any = {
      'John-3-16': 'This verse reminds us of God\'s immense love for humanity and His plan of salvation.',
      'Proverbs-3-5': 'Trust in the Lord completely, not in your own understanding.',
      'Philippians-4-13': 'Through Christ, we have the strength to face any challenge.',
      'Psalm-23-1': 'The Lord is our shepherd who provides for all our needs.',
      'Romans-8-28': 'God works all things together for the good of those who love Him.',
    };

    const key = `${book}-${chapter}-${verse}`;
    return reflections[key] || 'Meditate on this verse and let God speak to your heart.';
  }
}

export default new BibleService();
