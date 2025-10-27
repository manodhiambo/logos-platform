import { Router } from 'express';
import bibleController from '../controllers/bible.controller';
import { optionalAuth } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  searchVersesValidator,
  getVerseValidator,
  getPassageValidator,
  getDailyVerseValidator,
} from '../validators/bible.validator';

const router = Router();

/**
 * @route   GET /api/v1/bible/search
 * @desc    Search Bible verses
 * @access  Public
 */
router.get(
  '/search',
  searchVersesValidator,
  validate,
  bibleController.searchVerses
);

/**
 * @route   GET /api/v1/bible/verse/:book/:chapter/:verse
 * @desc    Get specific verse
 * @access  Public
 */
router.get(
  '/verse/:book/:chapter/:verse',
  getVerseValidator,
  validate,
  bibleController.getVerse
);

/**
 * @route   GET /api/v1/bible/passage/:book/:chapter/:verseRange
 * @desc    Get Bible passage (range of verses)
 * @access  Public
 */
router.get(
  '/passage/:book/:chapter/:verseRange',
  getPassageValidator,
  validate,
  bibleController.getPassage
);

/**
 * @route   GET /api/v1/bible/daily-verse
 * @desc    Get daily verse
 * @access  Public
 */
router.get(
  '/daily-verse',
  getDailyVerseValidator,
  validate,
  bibleController.getDailyVerse
);

/**
 * @route   GET /api/v1/bible/translations
 * @desc    Get available Bible translations
 * @access  Public
 */
router.get('/translations', bibleController.getTranslations);

/**
 * @route   GET /api/v1/bible/books
 * @desc    Get list of Bible books
 * @access  Public
 */
router.get('/books', bibleController.getBooks);

export default router;
