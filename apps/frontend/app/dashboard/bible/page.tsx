'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Verse {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

interface DailyVerse {
  verse: Verse;
  reflection?: string;
}

export default function BiblePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState('NIV');

  const searchBible = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get('/bible/search', {
        params: { q: searchQuery, translation, limit: 10 }
      });
      setSearchResults(response.data.data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Bible search is not available yet. Coming soon!');
    } finally {
      setLoading(false);
    }
  };

  const getDailyVerse = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bible/daily-verse', {
        params: { translation }
      });
      setDailyVerse(response.data.data);
    } catch (error) {
      console.error('Failed to get daily verse:', error);
      // Show a fallback verse
      setDailyVerse({
        verse: {
          id: 1,
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          translation: 'NIV'
        },
        reflection: 'This verse reminds us of God\'s incredible love for us.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold">📖 Bible Study</h1>

      {/* Daily Verse Section */}
      <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-lg md:text-xl font-semibold">✨ Verse of the Day</h2>
          <Button onClick={getDailyVerse} size="sm" variant="outline" className="w-full sm:w-auto">
            Get Daily Verse
          </Button>
        </div>
        
        {dailyVerse ? (
          <div>
            <p className="text-sm md:text-base italic text-gray-700 mb-3 leading-relaxed">
              "{dailyVerse.verse.text}"
            </p>
            <p className="text-xs md:text-sm font-semibold text-blue-600">
              {dailyVerse.verse.book} {dailyVerse.verse.chapter}:{dailyVerse.verse.verse} ({dailyVerse.verse.translation})
            </p>
            {dailyVerse.reflection && (
              <p className="mt-3 text-sm text-gray-600 border-t pt-3">
                💭 {dailyVerse.reflection}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Click above to see today's verse</p>
        )}
      </Card>

      {/* Search Section */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">🔍 Search the Bible</h2>
        
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search for verses... (e.g., love, faith, hope)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBible()}
              className="flex-1 text-sm md:text-base"
            />
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="border rounded px-3 py-2 text-sm md:text-base w-full sm:w-auto"
            >
              <option value="NIV">NIV</option>
              <option value="KJV">KJV</option>
              <option value="ESV">ESV</option>
              <option value="NKJV">NKJV</option>
            </select>
          </div>
          <Button onClick={searchBible} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-gray-600">{searchResults.length} results found</p>
            {searchResults.map((verse) => (
              <Card key={verse.id} className="p-4 hover:shadow-md transition">
                <p className="text-sm md:text-base text-gray-700 mb-2">
                  "{verse.text}"
                </p>
                <p className="text-xs md:text-sm font-semibold text-blue-600">
                  {verse.book} {verse.chapter}:{verse.verse}
                </p>
              </Card>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">📚 Bible search coming soon!</p>
            <p className="text-sm text-gray-400">
              We're working on integrating a comprehensive Bible database
            </p>
          </div>
        )}
      </Card>

      {/* Quick Access */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" size="sm" className="h-auto py-4 flex flex-col items-center gap-2">
          <span className="text-2xl">📕</span>
          <span className="text-xs">Genesis</span>
        </Button>
        <Button variant="outline" size="sm" className="h-auto py-4 flex flex-col items-center gap-2">
          <span className="text-2xl">📗</span>
          <span className="text-xs">Psalms</span>
        </Button>
        <Button variant="outline" size="sm" className="h-auto py-4 flex flex-col items-center gap-2">
          <span className="text-2xl">📘</span>
          <span className="text-xs">Matthew</span>
        </Button>
        <Button variant="outline" size="sm" className="h-auto py-4 flex flex-col items-center gap-2">
          <span className="text-2xl">📙</span>
          <span className="text-xs">Revelation</span>
        </Button>
      </div>
    </div>
  );
}
