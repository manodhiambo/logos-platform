import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import postService, { Post } from '../services/post.service';
import statusService, { StatusGroup } from '../services/status.service';
import uploadService from '../services/upload.service';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes('/video/');
}

function MediaGallery({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) return null;
  if (urls.length === 1) {
    const url = urls[0];
    return (
      <View style={media.single}>
        {isVideoUrl(url) ? (
          <Video
            source={{ uri: url }}
            style={media.singleVideo}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
          />
        ) : (
          <Image source={{ uri: url }} style={media.singleImage} resizeMode="cover" />
        )}
      </View>
    );
  }
  const cols = urls.length === 2 ? 2 : urls.length === 3 ? 3 : 2;
  const size = (SCREEN_WIDTH - 32 - 2 * (cols - 1)) / cols;
  return (
    <View style={[media.grid, { marginTop: 10 }]}>
      {urls.slice(0, 4).map((url, i) => (
        <View key={i} style={[media.gridItem, { width: size, height: size }]}>
          {isVideoUrl(url) ? (
            <Video
              source={{ uri: url }}
              style={{ width: size, height: size }}
              resizeMode={ResizeMode.COVER}
            />
          ) : (
            <Image source={{ uri: url }} style={{ width: size, height: size }} resizeMode="cover" />
          )}
          {i === 3 && urls.length > 4 && (
            <View style={media.moreOverlay}>
              <Text style={media.moreText}>+{urls.length - 4}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const media = StyleSheet.create({
  single: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  singleImage: {
    width: '100%',
    height: 240,
  },
  singleVideo: {
    width: '100%',
    height: 240,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#000',
    position: 'relative',
  },
  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

function StatusStrip({ onStatusPress }: { onStatusPress: () => void }) {
  const [groups, setGroups] = useState<StatusGroup[]>([]);

  useEffect(() => {
    statusService.getGroupedStatuses().then(setGroups).catch(() => {});
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.statusStrip}
      contentContainerStyle={styles.statusStripContent}
    >
      {/* Add status button */}
      <TouchableOpacity style={styles.statusItem} onPress={onStatusPress}>
        <View style={styles.addStatusRing}>
          <Text style={styles.addStatusIcon}>+</Text>
        </View>
        <Text style={styles.statusName}>Add</Text>
      </TouchableOpacity>

      {groups.map((group) => (
        <TouchableOpacity key={group.user.id} style={styles.statusItem} onPress={() => {}}>
          <View style={styles.statusRing}>
            {group.user.avatarUrl ? (
              <Image source={{ uri: group.user.avatarUrl }} style={styles.statusAvatar} />
            ) : (
              <View style={styles.statusAvatarFallback}>
                <Text style={styles.statusAvatarText}>
                  {(group.user.fullName?.[0] || 'U').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.statusName} numberOfLines={1}>
            {group.user.fullName?.split(' ')[0] || group.user.username}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function PostCard({
  post,
  currentUser,
  onLike,
  onDelete,
  navigation,
}: {
  post: Post;
  currentUser: any;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  navigation: any;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await postService.getComments(post.id);
      setComments(data?.comments || data || []);
    } catch (e) {}
    setLoadingComments(false);
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) await loadComments();
    setShowComments((v) => !v);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await postService.addComment(post.id, newComment.trim());
      setNewComment('');
      setCommentCount((c) => c + 1);
      loadComments();
    } catch (e) {}
  };

  const canDelete =
    currentUser &&
    (post.author.id === currentUser.id ||
      currentUser.role === 'admin' ||
      currentUser.role === 'super_admin');

  const initial = (post.author?.fullName?.[0] || 'U').toUpperCase();
  const formatTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(d).toLocaleDateString();
  };

  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.avatarWrap}>
          {post.author?.avatarUrl ? (
            <Image source={{ uri: post.author.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author?.fullName || 'Anonymous'}</Text>
          <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={() => onDelete(post.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>

      {post.content ? <Text style={styles.postContent}>{post.content}</Text> : null}
      <MediaGallery urls={post.mediaUrls || []} />

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={[styles.actionBtn, post.isLiked && styles.likedBtn]}
          onPress={() => onLike(post.id)}
        >
          <Text style={styles.actionIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>{post.likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleComments}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor="#94a3b8"
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={addComment}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.commentSendBtn, !newComment.trim() && styles.commentSendBtnDisabled]}
              onPress={addComment}
              disabled={!newComment.trim()}
            >
              <Text style={styles.commentSendText}>Post</Text>
            </TouchableOpacity>
          </View>
          {loadingComments ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 8 }} />
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(c.author?.fullName?.[0] || 'U').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>
                    {c.author?.fullName || c.author?.username}
                  </Text>
                  <Text style={styles.commentText}>{c.content}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function FeedScreen({ navigation }: any) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postService.getPosts();
      setPosts(data?.posts || data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    try {
      await postService.toggleLike(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert('Delete Post', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await postService.deletePost(postId);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImages(result.assets);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 120,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImages([{ ...result.assets[0], type: 'video' }]);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Write something or add media');
      return;
    }

    setUploading(true);
    try {
      let mediaUrls: string[] = [];
      let postType = 'regular';

      if (selectedImages.length > 0) {
        const firstAsset = selectedImages[0];
        const isVideo = firstAsset.type === 'video' || firstAsset.mimeType?.startsWith('video');

        if (isVideo) {
          const uploaded = await uploadService.uploadPostVideo({
            uri: firstAsset.uri,
            name: firstAsset.uri.split('/').pop() || 'video.mp4',
            type: firstAsset.mimeType || 'video/mp4',
          });
          mediaUrls = [uploaded.url];
          postType = 'video';
        } else {
          const files = selectedImages.map((img) => ({
            uri: img.uri,
            name: img.uri.split('/').pop() || 'image.jpg',
            type: img.mimeType || 'image/jpeg',
          }));
          const uploaded = await uploadService.uploadPostImages(files);
          mediaUrls = uploaded.map((f) => f.url);
          postType = 'photo';
        }
      }

      await postService.createPost({
        content: newPostContent.trim() || undefined,
        mediaUrls,
        postType,
      } as any);

      setShowModal(false);
      setNewPostContent('');
      setSelectedImages([]);
      setUploadedUrls([]);
      loadPosts();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const dismissModal = () => {
    setShowModal(false);
    setNewPostContent('');
    setSelectedImages([]);
    setUploadedUrls([]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={user}
            onLike={handleLike}
            onDelete={handleDelete}
            navigation={navigation}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPosts();
            }}
          />
        }
        ListHeaderComponent={
          <StatusStrip onStatusPress={() => navigation.navigate('Status')} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={dismissModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={dismissModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#94a3b8"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* Selected media preview */}
            {selectedImages.length > 0 && (
              <View style={styles.selectedMediaRow}>
                {selectedImages.map((img, i) => (
                  <View key={i} style={styles.selectedMediaItem}>
                    <Image source={{ uri: img.uri }} style={styles.selectedMediaThumb} />
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.removeMediaBtn}
                  onPress={() => setSelectedImages([])}
                >
                  <Text style={styles.removeMediaText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Media buttons */}
            {selectedImages.length === 0 && (
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaBtn} onPress={pickImages}>
                  <Text style={styles.mediaBtnIcon}>🖼️</Text>
                  <Text style={styles.mediaBtnText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaBtn} onPress={pickVideo}>
                  <Text style={styles.mediaBtnIcon}>🎥</Text>
                  <Text style={styles.mediaBtnText}>Video</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.postBtn,
                (uploading || (!newPostContent.trim() && selectedImages.length === 0)) &&
                  styles.postBtnDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={uploading || (!newPostContent.trim() && selectedImages.length === 0)}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, paddingBottom: 80 },
  // Status strip
  statusStrip: { marginBottom: 12 },
  statusStripContent: { paddingHorizontal: 4, gap: 12 },
  statusItem: { alignItems: 'center', width: 60 },
  addStatusRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  addStatusIcon: { fontSize: 26, color: '#3b82f6', lineHeight: 30 },
  statusRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#3b82f6',
    overflow: 'hidden',
    marginBottom: 4,
  },
  statusAvatar: { width: 56, height: 56 },
  statusAvatarFallback: {
    width: 56,
    height: 56,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  statusName: { fontSize: 11, color: '#64748b', textAlign: 'center', width: 60 },
  // Post card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatarImg: { width: 44, height: 44 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  postTime: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 18 },
  postContent: { fontSize: 15, color: '#334155', lineHeight: 22 },
  postFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  likedBtn: { backgroundColor: '#eff6ff' },
  actionIcon: { fontSize: 18 },
  actionText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  likedText: { color: '#3b82f6' },
  // Comments
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  commentInputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  commentInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  commentSendBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  commentSendBtnDisabled: { backgroundColor: '#cbd5e1' },
  commentSendText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  commentRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
  },
  commentAuthor: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 2 },
  commentText: { fontSize: 13, color: '#334155' },
  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  modalClose: { fontSize: 20, color: '#64748b', padding: 4 },
  postInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
    minHeight: 120,
    marginBottom: 12,
  },
  selectedMediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedMediaItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedMediaThumb: { width: 60, height: 60 },
  removeMediaBtn: { padding: 8 },
  removeMediaText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  mediaButtons: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mediaBtnIcon: { fontSize: 20 },
  mediaBtnText: { fontSize: 14, color: '#475569', fontWeight: '600' },
  postBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
