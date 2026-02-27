'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UploadedFile {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  localPreview?: string;
}

const BG_COLORS = [
  { value: '#667eea', label: 'Purple' },
  { value: '#f6d365', label: 'Gold' },
  { value: '#84fab0', label: 'Mint' },
  { value: '#fccb90', label: 'Peach' },
  { value: '#a18cd1', label: 'Lavender' },
  { value: '#f093fb', label: 'Pink' },
  { value: '#4facfe', label: 'Blue' },
  { value: '#43e97b', label: 'Green' },
];

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('regular');
  const [visibility, setVisibility] = useState('public');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 4 - uploadedFiles.filter(f => f.type === 'image').length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      toUpload.forEach(f => formData.append('images', f));

      const res = await apiClient.post('/upload/post-images', formData);

      const newFiles: UploadedFile[] = res.data.data.files.map((f: any) => ({
        url: f.url,
        type: 'image' as const,
        publicId: f.publicId,
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await apiClient.post('/upload/post-video', formData);

      const f = res.data.data.file;
      setUploadedFiles(prev => [...prev, { url: f.url, type: 'video', publicId: f.publicId }]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && uploadedFiles.length === 0) {
      alert('Please add some content or media to your post');
      return;
    }

    if (content.trim() && content.trim().length < 5) {
      alert('Post content must be at least 5 characters');
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.post('/posts', {
        content: content.trim(),
        postType,
        visibility,
        mediaUrls: uploadedFiles.map(f => f.url),
      });
      router.push('/dashboard/posts');
    } catch (err: any) {
      alert(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const hasVideo = uploadedFiles.some(f => f.type === 'video');
  const imageCount = uploadedFiles.filter(f => f.type === 'image').length;
  const canAddImages = !hasVideo && imageCount < 4;
  const canAddVideo = !hasVideo && imageCount === 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
        <p className="text-sm text-gray-500 mt-1">Share with the community</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your heart? Share a thought, testimony, prayer, or encouragement..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[120px]"
              rows={5}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length} chars</p>
          </div>

          {/* Media Previews */}
          {uploadedFiles.length > 0 && (
            <div className={`grid gap-2 ${uploadedFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {uploadedFiles.map((f, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
                  {f.type === 'video' ? (
                    <video src={f.url} className="w-full h-full object-cover" preload="metadata" />
                  ) : (
                    <img src={f.url} alt="Upload" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {f.type === 'video' ? '🎥 Video' : '📷 Photo'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {uploadError}
            </div>
          )}

          {/* Media Upload Buttons */}
          <div className="flex gap-2 flex-wrap">
            {canAddImages && (
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-700'}`}>
                📷 Add Photos {imageCount > 0 && `(${imageCount}/4)`}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}

            {canAddVideo && (
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-700'}`}>
                🎥 Add Video
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/quicktime,video/webm"
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* Post Type & Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="regular">Regular Post</option>
                <option value="announcement">Announcement</option>
                <option value="testimony">Testimony</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">🌍 Public</option>
                <option value="followers">👥 Followers Only</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting || uploading || (!content.trim() && uploadedFiles.length === 0)}
              className="flex-1"
            >
              {submitting ? 'Posting...' : 'Post'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
