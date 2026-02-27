'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BG_GRADIENTS = [
  { value: '#667eea', label: 'Purple', preview: 'from-blue-500 to-purple-600' },
  { value: '#f6d365', label: 'Gold', preview: 'from-yellow-400 to-orange-400' },
  { value: '#84fab0', label: 'Mint', preview: 'from-green-300 to-teal-400' },
  { value: '#f093fb', label: 'Pink', preview: 'from-pink-400 to-purple-500' },
  { value: '#4facfe', label: 'Sky', preview: 'from-blue-400 to-cyan-400' },
  { value: '#43e97b', label: 'Green', preview: 'from-green-400 to-emerald-500' },
  { value: '#fa709a', label: 'Rose', preview: 'from-rose-400 to-pink-600' },
  { value: '#a18cd1', label: 'Lavender', preview: 'from-purple-400 to-violet-500' },
  { value: '#1a1a2e', label: 'Dark', preview: 'from-gray-900 to-gray-800' },
];

type Mode = 'text' | 'photo' | 'video';

export default function NewStatusPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('text');
  const [content, setContent] = useState('');
  const [selectedBg, setSelectedBg] = useState('#667eea');
  const [textColor, setTextColor] = useState('#ffffff');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('media', file);

      const res = await apiClient.post('/upload/status-media', formData);

      const f = res.data.data.file;
      setMediaUrl(f.url);
      setMediaType(f.type);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (mode === 'text' && !content.trim()) {
      alert('Please enter some text for your status');
      return;
    }
    if ((mode === 'photo' || mode === 'video') && !mediaUrl) {
      alert('Please upload a file first');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/status', {
        content: content.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaUrl ? mediaType : undefined,
        backgroundColor: selectedBg,
        textColor,
      });
      router.push('/dashboard/status');
    } catch (err: any) {
      alert(err.message || 'Failed to create status');
    } finally {
      setSubmitting(false);
    }
  };

  // Live preview
  const preview = (
    <div
      className="w-full aspect-[9/16] rounded-2xl overflow-hidden flex items-center justify-center relative"
      style={{ backgroundColor: selectedBg }}
    >
      {mediaUrl && mediaType === 'image' && (
        <img src={mediaUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {mediaUrl && mediaType === 'video' && (
        <video src={mediaUrl} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />
      )}
      {content && (
        <div className={`relative z-10 p-6 text-center ${mediaUrl ? 'bg-black/40 w-full absolute bottom-0' : ''}`}>
          <p className="text-2xl font-semibold leading-snug" style={{ color: textColor }}>
            {content}
          </p>
        </div>
      )}
      {!content && !mediaUrl && (
        <p className="text-white/40 text-center text-sm px-4">Status preview</p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Status</h1>
          <p className="text-sm text-gray-500">Visible for 24 hours</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div className="space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            {(['text', 'photo', 'video'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setMediaUrl(null);
                  if (m === 'text') setContent('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                  mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m === 'text' ? '✏️ Text' : m === 'photo' ? '📷 Photo' : '🎥 Video'}
              </button>
            ))}
          </div>

          {/* Text input */}
          {mode === 'text' && (
            <div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your status message..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                maxLength={280}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{content.length}/280</p>
            </div>
          )}

          {/* Media upload */}
          {(mode === 'photo' || mode === 'video') && (
            <div>
              {!mediaUrl ? (
                <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
                  <div className="text-center">
                    <p className="text-3xl mb-1">{mode === 'photo' ? '📷' : '🎥'}</p>
                    <p className="text-sm font-medium text-gray-600">
                      {uploading ? 'Uploading...' : `Click to upload ${mode === 'photo' ? 'photo' : 'video'}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {mode === 'photo' ? 'JPG, PNG, GIF, WebP (max 50MB)' : 'MP4, MOV, WebM (max 50MB)'}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={mode === 'photo' ? 'image/*' : 'video/mp4,video/mov,video/quicktime,video/webm'}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              ) : (
                <div className="relative">
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-900">
                    {mediaType === 'image' ? (
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={mediaUrl} className="w-full h-full object-cover" preload="metadata" />
                    )}
                  </div>
                  <button
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-red-600 text-sm mt-2">{uploadError}</p>
              )}

              {/* Optional caption */}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Add a caption (optional)..."
                className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                maxLength={280}
              />
            </div>
          )}

          {/* Background color picker */}
          {(mode === 'text' || mediaUrl) && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                {mode === 'text' ? 'Background Color' : 'Overlay Color (for caption)'}
              </label>
              <div className="flex gap-2 flex-wrap">
                {BG_GRADIENTS.map(bg => (
                  <button
                    key={bg.value}
                    onClick={() => setSelectedBg(bg.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selectedBg === bg.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: bg.value }}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text color */}
          {(mode === 'text' || content) && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Text Color</label>
              <div className="flex gap-2">
                {['#ffffff', '#000000', '#fffbcc', '#ffcccc', '#ccffee'].map(c => (
                  <button
                    key={c}
                    onClick={() => setTextColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      textColor === c ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting || uploading || (!content.trim() && !mediaUrl)}
            className="w-full"
          >
            {submitting ? 'Sharing...' : 'Share Status'}
          </Button>
        </div>

        {/* Right: Preview */}
        <div className="hidden md:block">
          <label className="block text-xs font-medium text-gray-600 mb-2">Preview</label>
          {preview}
          <p className="text-xs text-gray-400 text-center mt-2">This is how your status will look</p>
        </div>
      </div>
    </div>
  );
}
