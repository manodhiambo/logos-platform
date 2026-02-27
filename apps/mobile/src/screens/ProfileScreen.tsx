import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getMe();
      setProfileData(data);
    } catch (error) {
      // Use cached user data on error
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const currentUser = profileData || user;
  const avatarInitial = (currentUser?.fullName?.[0] || currentUser?.username?.[0] || 'U').toUpperCase();

  const infoRows = [
    { label: 'Username', value: currentUser?.username ? `@${currentUser.username}` : '—' },
    { label: 'Email', value: currentUser?.email || '—' },
    { label: 'Role', value: currentUser?.role || 'member' },
    { label: 'Denomination', value: currentUser?.denomination || '—' },
    { label: 'Spiritual Journey', value: currentUser?.spiritualJourneyStage || '—' },
    { label: 'Country', value: currentUser?.country || '—' },
    {
      label: 'Email Verified',
      value: currentUser?.isEmailVerified ? 'Yes' : 'No',
      highlight: !currentUser?.isEmailVerified,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {currentUser?.avatarUrl ? (
            <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{currentUser?.fullName || 'Unknown User'}</Text>
        <Text style={styles.username}>@{currentUser?.username}</Text>
        {currentUser?.bio && (
          <Text style={styles.bio}>{currentUser.bio}</Text>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Information</Text>
        {infoRows.map((row, i) => (
          <View key={i} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={[styles.infoValue, row.highlight && styles.infoValueWarning]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>LOGOS Platform v1.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  infoValueWarning: {
    color: '#ef4444',
  },
  actions: {
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
  },
});
