import { Request, Response } from 'express';
import bibleService from '../services/bible.service';

export const searchBible = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q || req.query.query as string;
    const translation = (req.query.translation as string) || 'NKJV';
    const limit = parseInt(req.query.limit as string) || 20;
    
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
    const date = req.query.date as string;
    
    const dailyVerse = await bibleService.getDailyVerse(translation, date);
    
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
    const books = await bibleService.getBooks();
    
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
    const translations = await bibleService.getTranslations();
    
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
