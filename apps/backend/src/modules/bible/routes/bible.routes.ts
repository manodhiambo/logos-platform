import { Router } from 'express';
import {
  searchBible,
  getVerse,
  getDailyVerse,
  getBooks,
  getTranslations,
} from '../controllers/bible.controller';
import { validate } from '../../../shared/middlewares/validation.middleware';
import {
  searchBibleValidator,
  getVerseValidator,
  getDailyVerseValidator,
} from '../validators/bible.validator';

const router = Router();

router.get('/search', searchBibleValidator, validate, searchBible);
router.get('/verse/:book/:chapter/:verse', getVerseValidator, validate, getVerse);
router.get('/daily-verse', getDailyVerseValidator, validate, getDailyVerse);
router.get('/books', getBooks);
router.get('/translations', getTranslations);

export default router;
