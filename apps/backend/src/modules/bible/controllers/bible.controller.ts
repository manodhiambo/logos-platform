import { Request, Response } from 'express';
import { BibleService } from '../services/bible.service';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';

const bibleService = new BibleService();

export const searchBible = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q || req.query.query as string;
    const translation = (req.query.translation as string) || 'NKJV';
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!searchQuery) {
      return sendError(res, 'Search query is required', 400);
    }

    const results = await bibleService.searchVerses(searchQuery, translation, limit);
    sendSuccess(res, { results }, 'Search completed successfully');
  } catch (error: any) {
    console.error('Bible search error:', error);
    sendError(res, error.message || 'Failed to search Bible', 500);
  }
};

export const getVerse = async (req: Request, res: Response) => {
  try {
    const { book, chapter, verse } = req.params;
    const translation = (req.query.translation as string) || 'NKJV';
    
    const verseData = await bibleService.getVerse(book, parseInt(chapter), parseInt(verse), translation);
    sendSuccess(res, { verse: verseData }, 'Verse retrieved successfully');
  } catch (error: any) {
    console.error('Get verse error:', error);
    sendError(res, error.message || 'Failed to get verse', 500);
  }
};

export const getDailyVerse = async (req: Request, res: Response) => {
  try {
    const translation = (req.query.translation as string) || 'NKJV';
    const date = req.query.date as string;
    
    const dailyVerse = await bibleService.getDailyVerse(translation, date);
    sendSuccess(res, dailyVerse, 'Daily verse retrieved successfully');
  } catch (error: any) {
    console.error('Get daily verse error:', error);
    sendError(res, error.message || 'Failed to get daily verse', 500);
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await bibleService.getBooks();
    sendSuccess(res, { books }, 'Books retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to get books', 500);
  }
};

export const getTranslations = async (req: Request, res: Response) => {
  try {
    const translations = await bibleService.getTranslations();
    sendSuccess(res, { translations }, 'Translations retrieved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to get translations', 500);
  }
};
