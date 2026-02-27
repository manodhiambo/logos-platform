import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const QUICK_ACTIONS = [
  { icon: '📰', title: 'Community Feed', subtitle: 'Posts, photos & updates', screen: 'Feed' },
  { icon: '✨', title: 'Status Updates', subtitle: 'Share 24h status stories', screen: 'Status' },
  { icon: '🤖', title: 'LOGOS AI', subtitle: 'Biblical guidance & Q&A', screen: 'AIAssistant' },
  { icon: '💬', title: 'Messages', subtitle: 'Direct conversations', screen: 'Messages' },
  { icon: '🏘️', title: 'Communities', subtitle: 'Join faith-based groups', screen: 'Communities' },
  { icon: '🙏', title: 'Prayer Requests', subtitle: 'Share and pray together', screen: 'Prayers' },
  { icon: '📖', title: 'Daily Devotionals', subtitle: 'Grow in faith daily', screen: 'Devotionals' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day, {firstName}! 🙏</Text>
          <Text style={styles.subGreeting}>Welcome to LOGOS Platform</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('More')}
          style={styles.profileBtn}
        >
          <Text style={styles.profileBtnText}>
            {(user?.fullName?.[0] || 'U').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.screen}
              style={styles.card}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardIcon}>{action.icon}</Text>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            "I can do all things through Christ who strengthens me." — Philippians 4:13
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  banner: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    marginBottom: 24,
  },
  bannerText: {
    fontSize: 14,
    color: '#1e40af',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
