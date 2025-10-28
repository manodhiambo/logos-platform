import apiClient from '@/lib/api-client';

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface BibleTranslation {
  id: string;
  code: string;
  name: string;
  language: string;
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface SearchResult {
  verses: BibleVerse[];
  total: number;
}

class BibleService {
  async searchVerses(params: {
    query: string;
    translation?: string;
    book?: string;
    testament?: string;
    limit?: number;
  }) {
    const response = await apiClient.get('/bible/search', { params });
    return response.data.data;
  }

  async getVerse(book: string, chapter: number, verse: number, translation?: string) {
    const params = translation ? { translation } : {};
    const response = await apiClient.get(`/bible/verse/${book}/${chapter}/${verse}`, { params });
    return response.data.data;
  }

  async getPassage(book: string, chapter: number, verseRange: string, translation?: string) {
    const params = translation ? { translation } : {};
    const response = await apiClient.get(`/bible/passage/${book}/${chapter}/${verseRange}`, {
      params,
    });
    return response.data.data;
  }

  async getDailyVerse(translation?: string) {
    const params = translation ? { translation } : {};
    const response = await apiClient.get('/bible/daily-verse', { params });
    return response.data.data;
  }

  async getTranslations() {
    const response = await apiClient.get('/bible/translations');
    return response.data.data;
  }

  async getBooks() {
    const response = await apiClient.get('/bible/books');
    return response.data.data;
  }
}

export const bibleService = new BibleService();
