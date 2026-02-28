import axios from 'axios';
import BibleVerse from '../models/BibleVerse.model';
import BibleTranslation from '../models/BibleTranslation.model';
import { Op } from 'sequelize';
import { logger } from '../../../shared/utils/logger.util';

// Using Bible API: https://bible-api.com/
class BibleService {
  private bibleApiBase = 'https://bible-api.com';

  // Curated verses by topic — used when local DB has no matches
  private readonly TOPIC_VERSES: Record<string, { book: string; chapter: number; verse: number }[]> = {
    love: [
      { book: 'John', chapter: 3, verse: 16 },
      { book: '1 Corinthians', chapter: 13, verse: 4 },
      { book: '1 John', chapter: 4, verse: 8 },
      { book: 'Romans', chapter: 8, verse: 38 },
      { book: 'John', chapter: 15, verse: 13 },
    ],
    faith: [
      { book: 'Hebrews', chapter: 11, verse: 1 },
      { book: 'Romans', chapter: 10, verse: 17 },
      { book: 'Matthew', chapter: 17, verse: 20 },
      { book: 'Ephesians', chapter: 2, verse: 8 },
      { book: 'Galatians', chapter: 2, verse: 20 },
    ],
    hope: [
      { book: 'Jeremiah', chapter: 29, verse: 11 },
      { book: 'Romans', chapter: 15, verse: 13 },
      { book: 'Psalms', chapter: 31, verse: 24 },
      { book: 'Hebrews', chapter: 6, verse: 19 },
      { book: 'Romans', chapter: 8, verse: 28 },
    ],
    salvation: [
      { book: 'John', chapter: 3, verse: 16 },
      { book: 'Acts', chapter: 4, verse: 12 },
      { book: 'Ephesians', chapter: 2, verse: 8 },
      { book: 'Romans', chapter: 10, verse: 9 },
      { book: 'John', chapter: 14, verse: 6 },
    ],
    grace: [
      { book: 'Ephesians', chapter: 2, verse: 8 },
      { book: '2 Corinthians', chapter: 12, verse: 9 },
      { book: 'Romans', chapter: 6, verse: 14 },
      { book: 'Hebrews', chapter: 4, verse: 16 },
      { book: 'Titus', chapter: 2, verse: 11 },
    ],
    peace: [
      { book: 'John', chapter: 14, verse: 27 },
      { book: 'Philippians', chapter: 4, verse: 7 },
      { book: 'Isaiah', chapter: 26, verse: 3 },
      { book: 'Romans', chapter: 8, verse: 6 },
      { book: 'Psalms', chapter: 119, verse: 165 },
    ],
    strength: [
      { book: 'Philippians', chapter: 4, verse: 13 },
      { book: 'Isaiah', chapter: 40, verse: 31 },
      { book: 'Psalms', chapter: 46, verse: 1 },
      { book: '2 Timothy', chapter: 1, verse: 7 },
      { book: 'Ephesians', chapter: 6, verse: 10 },
    ],
    forgiveness: [
      { book: '1 John', chapter: 1, verse: 9 },
      { book: 'Ephesians', chapter: 4, verse: 32 },
      { book: 'Matthew', chapter: 6, verse: 14 },
      { book: 'Psalms', chapter: 103, verse: 12 },
      { book: 'Acts', chapter: 13, verse: 38 },
    ],
    prayer: [
      { book: 'Matthew', chapter: 6, verse: 9 },
      { book: 'Philippians', chapter: 4, verse: 6 },
      { book: '1 Thessalonians', chapter: 5, verse: 17 },
      { book: 'James', chapter: 5, verse: 16 },
      { book: 'Mark', chapter: 11, verse: 24 },
    ],
    wisdom: [
      { book: 'Proverbs', chapter: 3, verse: 5 },
      { book: 'James', chapter: 1, verse: 5 },
      { book: 'Proverbs', chapter: 9, verse: 10 },
      { book: 'Proverbs', chapter: 4, verse: 7 },
      { book: 'Colossians', chapter: 3, verse: 16 },
    ],
    joy: [
      { book: 'Philippians', chapter: 4, verse: 4 },
      { book: 'Psalms', chapter: 16, verse: 11 },
      { book: 'John', chapter: 15, verse: 11 },
      { book: 'Romans', chapter: 15, verse: 13 },
      { book: 'Nehemiah', chapter: 8, verse: 10 },
    ],
    trust: [
      { book: 'Proverbs', chapter: 3, verse: 5 },
      { book: 'Psalms', chapter: 37, verse: 5 },
      { book: 'Isaiah', chapter: 26, verse: 4 },
      { book: 'Psalms', chapter: 125, verse: 1 },
      { book: 'Psalms', chapter: 23, verse: 1 },
    ],
    fear: [
      { book: 'Isaiah', chapter: 41, verse: 10 },
      { book: 'Joshua', chapter: 1, verse: 9 },
      { book: '2 Timothy', chapter: 1, verse: 7 },
      { book: 'Psalms', chapter: 27, verse: 1 },
      { book: 'Romans', chapter: 8, verse: 15 },
    ],
    courage: [
      { book: 'Joshua', chapter: 1, verse: 9 },
      { book: 'Deuteronomy', chapter: 31, verse: 6 },
      { book: 'Psalms', chapter: 27, verse: 14 },
      { book: 'Isaiah', chapter: 41, verse: 10 },
      { book: '1 Corinthians', chapter: 16, verse: 13 },
    ],
    healing: [
      { book: 'Psalms', chapter: 147, verse: 3 },
      { book: 'James', chapter: 5, verse: 14 },
      { book: 'Isaiah', chapter: 53, verse: 5 },
      { book: 'Jeremiah', chapter: 30, verse: 17 },
      { book: 'Matthew', chapter: 11, verse: 28 },
    ],
    comfort: [
      { book: 'Psalms', chapter: 23, verse: 4 },
      { book: '2 Corinthians', chapter: 1, verse: 3 },
      { book: 'Matthew', chapter: 11, verse: 28 },
      { book: 'Psalms', chapter: 34, verse: 18 },
      { book: 'Isaiah', chapter: 40, verse: 31 },
    ],
    anxiety: [
      { book: 'Philippians', chapter: 4, verse: 6 },
      { book: '1 Peter', chapter: 5, verse: 7 },
      { book: 'Matthew', chapter: 6, verse: 25 },
      { book: 'Psalms', chapter: 94, verse: 19 },
      { book: 'Isaiah', chapter: 41, verse: 10 },
    ],
    worry: [
      { book: 'Matthew', chapter: 6, verse: 25 },
      { book: 'Philippians', chapter: 4, verse: 6 },
      { book: '1 Peter', chapter: 5, verse: 7 },
      { book: 'Psalms', chapter: 55, verse: 22 },
      { book: 'Luke', chapter: 12, verse: 25 },
    ],
    marriage: [
      { book: 'Ephesians', chapter: 5, verse: 25 },
      { book: 'Genesis', chapter: 2, verse: 24 },
      { book: 'Proverbs', chapter: 18, verse: 22 },
      { book: 'Hebrews', chapter: 13, verse: 4 },
      { book: 'Colossians', chapter: 3, verse: 19 },
    ],
    family: [
      { book: 'Proverbs', chapter: 22, verse: 6 },
      { book: 'Ephesians', chapter: 6, verse: 1 },
      { book: 'Joshua', chapter: 24, verse: 15 },
      { book: 'Psalms', chapter: 128, verse: 3 },
      { book: 'Proverbs', chapter: 17, verse: 6 },
    ],
    money: [
      { book: '1 Timothy', chapter: 6, verse: 10 },
      { book: 'Matthew', chapter: 6, verse: 24 },
      { book: 'Luke', chapter: 16, verse: 13 },
      { book: 'Proverbs', chapter: 22, verse: 7 },
      { book: 'Malachi', chapter: 3, verse: 10 },
    ],
    work: [
      { book: 'Colossians', chapter: 3, verse: 23 },
      { book: 'Proverbs', chapter: 12, verse: 11 },
      { book: 'Ecclesiastes', chapter: 9, verse: 10 },
      { book: '2 Thessalonians', chapter: 3, verse: 10 },
      { book: 'Proverbs', chapter: 6, verse: 6 },
    ],
    sin: [
      { book: 'Romans', chapter: 3, verse: 23 },
      { book: '1 John', chapter: 1, verse: 9 },
      { book: 'Romans', chapter: 6, verse: 23 },
      { book: 'Isaiah', chapter: 59, verse: 2 },
      { book: 'Hebrews', chapter: 12, verse: 1 },
    ],
    praise: [
      { book: 'Psalms', chapter: 150, verse: 6 },
      { book: 'Psalms', chapter: 100, verse: 4 },
      { book: 'Hebrews', chapter: 13, verse: 15 },
      { book: 'Ephesians', chapter: 5, verse: 19 },
      { book: 'Psalms', chapter: 34, verse: 1 },
    ],
    worship: [
      { book: 'John', chapter: 4, verse: 24 },
      { book: 'Psalms', chapter: 95, verse: 6 },
      { book: 'Romans', chapter: 12, verse: 1 },
      { book: 'Psalms', chapter: 100, verse: 2 },
      { book: 'Revelation', chapter: 4, verse: 11 },
    ],
    truth: [
      { book: 'John', chapter: 8, verse: 32 },
      { book: 'John', chapter: 14, verse: 6 },
      { book: 'John', chapter: 17, verse: 17 },
      { book: 'Psalms', chapter: 119, verse: 160 },
      { book: '3 John', chapter: 1, verse: 4 },
    ],
    light: [
      { book: 'John', chapter: 8, verse: 12 },
      { book: 'Psalms', chapter: 119, verse: 105 },
      { book: 'Matthew', chapter: 5, verse: 14 },
      { book: 'Ephesians', chapter: 5, verse: 8 },
      { book: '1 John', chapter: 1, verse: 5 },
    ],
    eternal: [
      { book: 'John', chapter: 3, verse: 16 },
      { book: 'Romans', chapter: 6, verse: 23 },
      { book: 'John', chapter: 17, verse: 3 },
      { book: '1 John', chapter: 5, verse: 13 },
      { book: 'John', chapter: 10, verse: 28 },
    ],
    holy: [
      { book: '1 Peter', chapter: 1, verse: 16 },
      { book: 'Hebrews', chapter: 12, verse: 14 },
      { book: 'Romans', chapter: 12, verse: 1 },
      { book: '1 Thessalonians', chapter: 4, verse: 7 },
      { book: 'Isaiah', chapter: 6, verse: 3 },
    ],
    god: [
      { book: 'John', chapter: 3, verse: 16 },
      { book: 'Genesis', chapter: 1, verse: 1 },
      { book: 'Psalms', chapter: 46, verse: 10 },
      { book: 'Deuteronomy', chapter: 6, verse: 4 },
      { book: '1 John', chapter: 4, verse: 16 },
    ],
    jesus: [
      { book: 'John', chapter: 14, verse: 6 },
      { book: 'John', chapter: 11, verse: 25 },
      { book: 'Philippians', chapter: 2, verse: 9 },
      { book: 'John', chapter: 3, verse: 16 },
      { book: 'Romans', chapter: 10, verse: 9 },
    ],
    holy_spirit: [
      { book: 'John', chapter: 14, verse: 26 },
      { book: 'Acts', chapter: 1, verse: 8 },
      { book: 'Romans', chapter: 8, verse: 26 },
      { book: 'Galatians', chapter: 5, verse: 22 },
      { book: '1 Corinthians', chapter: 6, verse: 19 },
    ],
  };

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
   * Find curated verse references for a given keyword
   */
  private findTopicVerses(query: string): { book: string; chapter: number; verse: number }[] {
    const q = query.toLowerCase().trim();

    // Direct match
    if (this.TOPIC_VERSES[q]) return this.TOPIC_VERSES[q];

    // Handle "holy spirit" as a compound key
    if (q.includes('holy spirit') || q.includes('holy ghost')) return this.TOPIC_VERSES['holy_spirit'];

    // Partial match
    for (const [topic, verses] of Object.entries(this.TOPIC_VERSES)) {
      if (topic.includes(q) || q.includes(topic)) return verses;
    }

    return [];
  }

  /**
   * Fetch a single verse from bible-api.com
   */
  private async fetchVerseFromApi(
    book: string,
    chapter: number,
    verse: number,
    apiTranslation: string
  ): Promise<any | null> {
    try {
      const passage = `${book} ${chapter}:${verse}`;
      const response = await axios.get(
        `${this.bibleApiBase}/${encodeURIComponent(passage)}?translation=${apiTranslation}`,
        { timeout: 10000 }
      );

      const v = response.data?.verses?.[0];
      if (!v) return null;

      return {
        id: 0,
        book: v.book_name || book,
        chapter: v.chapter || chapter,
        verse: v.verse || verse,
        translation: apiTranslation.toUpperCase(),
        text: v.text?.trim() || '',
        reference: `${v.book_name || book} ${chapter}:${verse}`,
      };
    } catch {
      return null;
    }
  }

  /**
   * Search Bible verses by keyword
   */
  async searchVerses(query: string, translation: string = 'nkjv', page: number = 1, limit: number = 20) {
    try {
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

      // Fallback: look up topic verses via bible-api.com
      const topicRefs = this.findTopicVerses(query);
      if (topicRefs.length > 0) {
        logger.info(`Using topic fallback for query: "${query}"`);
        const apiTranslation = this.mapTranslation(translation);
        const fetched = await Promise.all(
          topicRefs.slice(0, limit).map(ref =>
            this.fetchVerseFromApi(ref.book, ref.chapter, ref.verse, apiTranslation)
          )
        );
        const valid = fetched.filter((v): v is NonNullable<typeof v> => v !== null && v.text !== '');

        if (valid.length > 0) {
          return {
            results: valid,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalResults: valid.length,
              limit,
            },
          };
        }
      }

      // Nothing found
      return {
        results: [],
        pagination: { currentPage: page, totalPages: 0, totalResults: 0, limit },
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
        { book: 'Psalms', chapter: 23, verse: 1 },
        { book: 'Romans', chapter: 8, verse: 28 },
        { book: 'Matthew', chapter: 28, verse: 20 },
        { book: 'Isaiah', chapter: 40, verse: 31 },
        { book: 'Jeremiah', chapter: 29, verse: 11 },
        { book: '2 Timothy', chapter: 1, verse: 7 },
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
