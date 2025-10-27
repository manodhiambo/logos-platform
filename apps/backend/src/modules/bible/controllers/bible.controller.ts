import { Request, Response, NextFunction } from 'express';
import bibleService from '../services/bible.service';
import { successResponse } from '../../../shared/utils/response.util';

class BibleController {
  /**
   * Search Bible verses
   */
  async searchVerses(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, translation = 'nkjv', page = 1, limit = 20 } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const result = await bibleService.searchVerses(
        q,
        translation as string,
        Number(page),
        Number(limit)
      );

      return successResponse(res, 'Verses retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get specific verse
   */
  async getVerse(req: Request, res: Response, next: NextFunction) {
    try {
      const { book, chapter, verse } = req.params;
      const { translation = 'nkjv' } = req.query;

      const result = await bibleService.getVerse(
        book,
        Number(chapter),
        Number(verse),
        translation as string
      );

      return successResponse(res, 'Verse retrieved successfully', { verse: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get Bible passage (range of verses)
   */
  async getPassage(req: Request, res: Response, next: NextFunction) {
    try {
      const { book, chapter, verseRange } = req.params;
      const { translation = 'nkjv' } = req.query;

      // Parse verse range (e.g., "1-6")
      const [verseStart, verseEnd] = verseRange.split('-').map(Number);

      if (!verseStart || !verseEnd) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verse range format. Use: verseStart-verseEnd',
        });
      }

      const result = await bibleService.getPassage(
        book,
        Number(chapter),
        verseStart,
        verseEnd,
        translation as string
      );

      return successResponse(res, 'Passage retrieved successfully', { passage: result });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get daily verse
   */
  async getDailyVerse(req: Request, res: Response, next: NextFunction) {
    try {
      const { translation = 'nkjv' } = req.query;

      const result = await bibleService.getDailyVerse(translation as string);

      return successResponse(res, 'Daily verse retrieved successfully', result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get available translations
   */
  async getTranslations(req: Request, res: Response, next: NextFunction) {
    try {
      const translations = await bibleService.getTranslations();

      return successResponse(res, 'Translations retrieved successfully', { translations });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get books of the Bible
   */
  async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const books = bibleService.getBibleBooks();

      return successResponse(res, 'Bible books retrieved successfully', books);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new BibleController();
