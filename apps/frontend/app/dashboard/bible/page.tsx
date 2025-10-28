'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  bibleService,
  BibleVerse,
  BibleBook,
  BibleTranslation,
} from '@/lib/services/bible.service';

export default function BiblePage() {
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null);
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState('NKJV');
  const [loading, setLoading] = useState(true);

  // Reader state
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [passage, setPassage] = useState<BibleVerse[]>([]);
  const [loadingPassage, setLoadingPassage] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [dailyData, translationsData, booksData] = await Promise.all([
        bibleService.getDailyVerse(),
        bibleService.getTranslations(),
        bibleService.getBooks(),
      ]);

      setDailyVerse(dailyData.verse);
      setTranslations(translationsData.translations || []);
      setBooks(booksData.books || []);

      if (booksData.books && booksData.books.length > 0) {
        setSelectedBook(booksData.books[0].name);
      }
    } catch (error) {
      console.error('Failed to load Bible data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPassage = async () => {
    if (!selectedBook) return;

    try {
      setLoadingPassage(true);
      const data = await bibleService.getPassage(
        selectedBook,
        selectedChapter,
        '1-50', // Load up to 50 verses
        selectedTranslation
      );
      setPassage(data.verses || []);
    } catch (error) {
      console.error('Failed to load passage:', error);
      alert('Failed to load passage');
    } finally {
      setLoadingPassage(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const data = await bibleService.searchVerses({
        query: searchQuery,
        translation: selectedTranslation,
        limit: 50,
      });
      setSearchResults(data.verses || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const selectedBookData = books.find((b) => b.name === selectedBook);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bible Reader</h1>
            <p className="text-slate-600 mt-2">Read and explore God's Word</p>
          </div>
          <select
            value={selectedTranslation}
            onChange={(e) => setSelectedTranslation(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {translations.map((trans) => (
              <option key={trans.code} value={trans.code}>
                {trans.name} ({trans.code})
              </option>
            ))}
          </select>
        </div>

        {/* Daily Verse */}
        {dailyVerse && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Verse of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 p-6 rounded-lg">
                <p className="text-sm font-semibold text-primary mb-2">
                  {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}
                </p>
                <p className="text-lg italic text-slate-800">"{dailyVerse.text}"</p>
                <p className="text-sm text-slate-500 mt-3">— {dailyVerse.translation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bible Reader Tabs */}
        <Tabs defaultValue="reader" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reader">📖 Reader</TabsTrigger>
            <TabsTrigger value="search">🔍 Search</TabsTrigger>
          </TabsList>

          {/* Reader Tab */}
          <TabsContent value="reader">
            <Card>
              <CardHeader>
                <CardTitle>Read the Bible</CardTitle>
                <CardDescription>Select a book and chapter to read</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Book and Chapter Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Book</label>
                    <select
                      value={selectedBook}
                      onChange={(e) => setSelectedBook(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <optgroup label="Old Testament">
                        {books
                          .filter((b) => b.testament === 'old')
                          .map((book) => (
                            <option key={book.name} value={book.name}>
                              {book.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="New Testament">
                        {books
                          .filter((b) => b.testament === 'new')
                          .map((book) => (
                            <option key={book.name} value={book.name}>
                              {book.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chapter</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedChapter}
                        onChange={(e) => setSelectedChapter(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {selectedBookData &&
                          Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map(
                            (ch) => (
                              <option key={ch} value={ch}>
                                Chapter {ch}
                              </option>
                            )
                          )}
                      </select>
                      <Button onClick={loadPassage} disabled={loadingPassage}>
                        {loadingPassage ? 'Loading...' : 'Read'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Passage Display */}
                {loadingPassage ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading passage...</p>
                  </div>
                ) : passage.length > 0 ? (
                  <div className="bg-slate-50 p-6 rounded-lg space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      {selectedBook} {selectedChapter}
                    </h3>
                    {passage.map((verse) => (
                      <p key={verse.id} className="text-slate-700 leading-relaxed">
                        <sup className="text-primary font-semibold mr-1">{verse.verse}</sup>
                        {verse.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-6xl mb-4">📖</p>
                    <p>Select a book and chapter to start reading</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Search the Bible</CardTitle>
                <CardDescription>Find verses by keywords or topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for verses (e.g., love, faith, hope...)"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={searching}>
                    {searching ? 'Searching...' : '🔍 Search'}
                  </Button>
                </form>

                {/* Search Results */}
                {searching ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Found {searchResults.length} verse{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    {searchResults.map((verse) => (
                      <div
                        key={verse.id}
                        className="bg-slate-50 p-4 rounded-lg border-l-4 border-primary"
                      >
                        <p className="text-sm font-semibold text-primary mb-2">
                          {verse.book} {verse.chapter}:{verse.verse}
                        </p>
                        <p className="text-slate-700">{verse.text}</p>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && !searching ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-6xl mb-4">🔍</p>
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-6xl mb-4">🔍</p>
                    <p>Enter keywords to search the Bible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
