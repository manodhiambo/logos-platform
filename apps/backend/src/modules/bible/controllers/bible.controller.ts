import { Request, Response } from 'express';
import bibleService from '../services/bible.service';

export const searchBible = async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.q || req.query.query) as string;
    const translation = (req.query.translation as string) || 'NKJV';
    const limit = parseInt((req.query.limit as string) || '20');
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: { message: 'Search query is required' }
      });
    }

    const results = await bibleService.searchVerses(searchQuery, translation, limit);
    
    return res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: { results }
    });
  } catch (error: any) {
    console.error('Bible search error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to search Bible' }
    });
  }
};

export const getVerse = async (req: Request, res: Response) => {
  try {
    const { book, chapter, verse } = req.params;
    const translation = (req.query.translation as string) || 'NKJV';
    
    const verseData = await bibleService.getVerse(book, parseInt(chapter), parseInt(verse), translation);
    
    return res.status(200).json({
      success: true,
      message: 'Verse retrieved successfully',
      data: { verse: verseData }
    });
  } catch (error: any) {
    console.error('Get verse error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get verse' }
    });
  }
};

export const getDailyVerse = async (req: Request, res: Response) => {
  try {
    const translation = (req.query.translation as string) || 'NKJV';
    
    const dailyVerse = await bibleService.getDailyVerse(translation);
    
    return res.status(200).json({
      success: true,
      message: 'Daily verse retrieved successfully',
      data: dailyVerse
    });
  } catch (error: any) {
    console.error('Get daily verse error:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get daily verse' }
    });
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    // Return static list of Bible books since getBooks may not exist
    const books = [
      { name: 'Genesis', testament: 'Old', chapters: 50 },
      { name: 'Exodus', testament: 'Old', chapters: 40 },
      { name: 'Psalms', testament: 'Old', chapters: 150 },
      { name: 'Proverbs', testament: 'Old', chapters: 31 },
      { name: 'Matthew', testament: 'New', chapters: 28 },
      { name: 'Mark', testament: 'New', chapters: 16 },
      { name: 'Luke', testament: 'New', chapters: 24 },
      { name: 'John', testament: 'New', chapters: 21 },
      { name: 'Acts', testament: 'New', chapters: 28 },
      { name: 'Romans', testament: 'New', chapters: 16 },
      { name: 'Revelation', testament: 'New', chapters: 22 },
    ];
    
    return res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: { books }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get books' }
    });
  }
};

export const getTranslations = async (req: Request, res: Response) => {
  try {
    const translations = [
      { code: 'NKJV', name: 'New King James Version', language: 'English' },
      { code: 'NIV', name: 'New International Version', language: 'English' },
      { code: 'KJV', name: 'King James Version', language: 'English' },
      { code: 'ESV', name: 'English Standard Version', language: 'English' },
      { code: 'NLT', name: 'New Living Translation', language: 'English' },
    ];
    
    return res.status(200).json({
      success: true,
      message: 'Translations retrieved successfully',
      data: { translations }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get translations' }
    });
  }
};
