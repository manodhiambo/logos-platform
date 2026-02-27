import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import statusService, { StatusGroup, Status } from '../services/status.service';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function StatusViewer({
  groups,
  initialGroupIndex,
  onClose,
}: {
  groups: StatusGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [statusIndex, setStatusIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentGroup = groups[groupIndex];
  const currentStatus = currentGroup?.statuses[statusIndex];
  const totalInGroup = currentGroup?.statuses.length || 1;

  useEffect(() => {
    startProgress();
    if (currentStatus) {
      statusService.viewStatus(currentStatus.id).catch(() => {});
    }
    return () => {
      animRef.current?.stop();
    };
  }, [groupIndex, statusIndex]);

  const startProgress = () => {
    progressAnim.setValue(0);
    animRef.current?.stop();
    animRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) goNext();
    });
  };

  const goNext = () => {
    if (statusIndex < totalInGroup - 1) {
      setStatusIndex(i => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(i => i + 1);
      setStatusIndex(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (statusIndex > 0) {
      setStatusIndex(i => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(i => i - 1);
      setStatusIndex(0);
    }
  };

  if (!currentStatus) return null;

  return (
    <View style={viewer.container}>
      {/* Background */}
      <View style={[viewer.bg, { backgroundColor: currentStatus.backgroundColor || '#1a1a2e' }]}>
        {currentStatus.mediaUrl && currentStatus.mediaType === 'image' && (
          <Image source={{ uri: currentStatus.mediaUrl }} style={viewer.media} resizeMode="cover" />
        )}
        {currentStatus.mediaUrl && currentStatus.mediaType === 'video' && (
          <Video
            source={{ uri: currentStatus.mediaUrl }}
            style={viewer.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
          />
        )}

        {/* Progress bars */}
        <View style={viewer.progressRow}>
          {currentGroup.statuses.map((_, i) => (
            <View key={i} style={viewer.progressTrack}>
              <Animated.View
                style={[
                  viewer.progressBar,
                  {
                    width:
                      i < statusIndex
                        ? '100%'
                        : i === statusIndex
                        ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={viewer.header}>
          <View style={viewer.userRow}>
            <View style={viewer.avatar}>
              {currentGroup.user.avatarUrl ? (
                <Image source={{ uri: currentGroup.user.avatarUrl }} style={viewer.avatarImg} />
              ) : (
                <Text style={viewer.avatarText}>
                  {(currentGroup.user.fullName?.[0] || 'U').toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text style={viewer.userName}>{currentGroup.user.fullName}</Text>
              <Text style={viewer.userTime}>
                {new Date(currentStatus.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={viewer.closeBtn}>
            <Text style={viewer.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {currentStatus.content && (
          <View style={viewer.textOverlay}>
            <Text style={[viewer.statusText, { color: currentStatus.textColor || '#fff' }]}>
              {currentStatus.content}
            </Text>
          </View>
        )}

        {/* Views */}
        <View style={viewer.viewsRow}>
          <Text style={viewer.viewsText}>👁 {currentStatus.viewsCount}</Text>
        </View>
      </View>

      {/* Tap zones */}
      <TouchableOpacity style={viewer.tapLeft} onPress={goPrev} />
      <TouchableOpacity style={viewer.tapRight} onPress={goNext} />
    </View>
  );
}

export default function StatusScreen({ navigation }: any) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StatusGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const data = await statusService.getGroupedStatuses();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatus = (index: number) => {
    setSelectedGroupIndex(index);
    setViewerVisible(true);
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* My Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Status</Text>
          <TouchableOpacity
            style={styles.myStatusCard}
            onPress={() => navigation.navigate('CreateStatus')}
          >
            <View style={styles.addBubble}>
              <Text style={styles.addIcon}>+</Text>
            </View>
            <View>
              <Text style={styles.myStatusLabel}>Add to my status</Text>
              <Text style={styles.myStatusSub}>Share a photo, video, or text</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Updates */}
        {groups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
            {groups.map((group, i) => (
              <TouchableOpacity
                key={group.user.id}
                style={styles.statusRow}
                onPress={() => openStatus(i)}
              >
                <View style={styles.ringWrapper}>
                  <View style={styles.ring}>
                    {group.user.avatarUrl ? (
                      <Image source={{ uri: group.user.avatarUrl }} style={styles.groupAvatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                          {(group.user.fullName?.[0] || 'U').toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{group.user.fullName}</Text>
                  <Text style={styles.rowSub}>
                    {group.count} update{group.count !== 1 ? 's' : ''} •{' '}
                    {new Date(group.statuses[0].createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {groups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>No statuses yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to share a status update with the community
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateStatus')}
            >
              <Text style={styles.createButtonText}>Create Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={viewerVisible} animationType="fade" statusBarTranslucent>
        {viewerVisible && (
          <StatusViewer
            groups={groups}
            initialGroupIndex={selectedGroupIndex}
            onClose={() => setViewerVisible(false)}
          />
        )}
      </Modal>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateStatus')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const viewer = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bg: {
    flex: 1,
    justifyContent: 'center',
  },
  media: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressRow: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  header: {
    position: 'absolute',
    top: 62,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 36,
    height: 36,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  userTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 6,
    lineHeight: 30,
  },
  viewsRow: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  viewsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SCREEN_WIDTH * 0.35,
    bottom: 0,
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: SCREEN_WIDTH * 0.65,
    bottom: 0,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 28,
    color: '#3b82f6',
    lineHeight: 32,
  },
  myStatusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  myStatusSub: {
    fontSize: 13,
    color: '#64748b',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ringWrapper: {
    padding: 2,
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#3b82f6',
    padding: 2,
    overflow: 'hidden',
  },
  groupAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
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
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
});
