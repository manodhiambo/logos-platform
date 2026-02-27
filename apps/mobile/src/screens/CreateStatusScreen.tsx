import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import statusService from '../services/status.service';
import uploadService from '../services/upload.service';

const BG_COLORS = [
  '#667eea', '#f6d365', '#84fab0', '#f093fb',
  '#4facfe', '#43e97b', '#fa709a', '#a18cd1', '#1a1a2e',
];

const TEXT_COLORS = ['#ffffff', '#000000', '#fffbcc', '#ffcccc', '#ccffee'];

export default function CreateStatusScreen({ navigation }: any) {
  const [mode, setMode] = useState<'text' | 'photo' | 'video'>('text');
  const [content, setContent] = useState('');
  const [selectedBg, setSelectedBg] = useState('#667eea');
  const [textColor, setTextColor] = useState('#ffffff');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mode === 'photo'
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaType(asset.type === 'video' ? 'video' : 'image');
      await uploadMedia(asset);
    }
  };

  const uploadMedia = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const fileName = asset.uri.split('/').pop() || 'media';
      const fileType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const uploaded = await uploadService.uploadStatusMedia({
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });
      setUploadedUrl(uploaded.url);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Failed to upload media');
      setMediaUri(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'text' && !content.trim()) {
      Alert.alert('Error', 'Please enter some text for your status');
      return;
    }
    if ((mode === 'photo' || mode === 'video') && !uploadedUrl) {
      Alert.alert('Error', 'Please upload a file first');
      return;
    }
    if (uploading) {
      Alert.alert('Please wait', 'Media is still uploading...');
      return;
    }

    setSubmitting(true);
    try {
      await statusService.createStatus({
        content: content.trim() || undefined,
        mediaUrl: uploadedUrl || undefined,
        mediaType: uploadedUrl ? mediaType : undefined,
        backgroundColor: selectedBg,
        textColor,
      });
      Alert.alert('Posted!', 'Your status is now live for 24 hours.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Mode Selector */}
      <View style={styles.modeRow}>
        {(['text', 'photo', 'video'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
            onPress={() => {
              setMode(m);
              setMediaUri(null);
              setUploadedUrl(null);
            }}
          >
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
              {m === 'text' ? '✏️ Text' : m === 'photo' ? '📷 Photo' : '🎥 Video'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview */}
      <View style={[styles.preview, { backgroundColor: selectedBg }]}>
        {mediaUri && mediaType === 'image' && (
          <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="cover" />
        )}
        {content ? (
          <View style={[styles.previewTextWrapper, mediaUri ? styles.previewTextOverlay : null]}>
            <Text style={[styles.previewText, { color: textColor }]}>{content}</Text>
          </View>
        ) : !mediaUri ? (
          <Text style={styles.previewPlaceholder}>Preview</Text>
        ) : null}
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </View>

      {/* Text Input */}
      {mode === 'text' && (
        <View style={styles.section}>
          <TextInput
            style={styles.textInput}
            placeholder="Write your status..."
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={280}
          />
          <Text style={styles.charCount}>{content.length}/280</Text>
        </View>
      )}

      {/* Media Picker */}
      {(mode === 'photo' || mode === 'video') && (
        <View style={styles.section}>
          {!mediaUri ? (
            <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
              <Text style={styles.mediaPickerIcon}>{mode === 'photo' ? '📷' : '🎥'}</Text>
              <Text style={styles.mediaPickerText}>
                Tap to select {mode === 'photo' ? 'a photo' : 'a video'}
              </Text>
              <Text style={styles.mediaPickerSub}>
                {mode === 'photo' ? 'JPG, PNG, GIF (max 50MB)' : 'MP4, MOV (max 60s)'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.mediaPreviewRow}>
              <Text style={styles.mediaReady}>
                {uploadedUrl ? '✅ Ready to post' : uploading ? '⏳ Uploading...' : '📎 Selected'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMediaUri(null);
                  setUploadedUrl(null);
                }}
              >
                <Text style={styles.removeMedia}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Optional caption */}
          <TextInput
            style={[styles.textInput, { marginTop: 12 }]}
            placeholder="Add a caption (optional)..."
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={280}
          />
        </View>
      )}

      {/* Background Color */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Background Color</Text>
        <View style={styles.colorRow}>
          {BG_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                selectedBg === c && styles.colorDotSelected,
              ]}
              onPress={() => setSelectedBg(c)}
            />
          ))}
        </View>
      </View>

      {/* Text Color */}
      {(mode === 'text' || content.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Text Color</Text>
          <View style={styles.colorRow}>
            {TEXT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderColor: '#cbd5e1', borderWidth: 1 },
                  textColor === c && styles.colorDotSelected,
                ]}
                onPress={() => setTextColor(c)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (submitting || uploading || (!content.trim() && !uploadedUrl)) && styles.submitBtnDisabled,
        ]}
        onPress={handleSubmit}
        disabled={submitting || uploading || (!content.trim() && !uploadedUrl)}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Share Status</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#3b82f6',
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  preview: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewMedia: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewTextWrapper: {
    padding: 20,
    alignItems: 'center',
  },
  previewTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  previewText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  previewPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  mediaPicker: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  mediaPickerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  mediaPickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  mediaPickerSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  mediaPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  mediaReady: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  removeMedia: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#1e293b',
    transform: [{ scale: 1.15 }],
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
