import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import devotionalService, { Devotional } from '../services/devotional.service';

export default function DevotionalsScreen() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [todayDevotional, setTodayDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDevotionals();
  }, []);

  const loadDevotionals = async () => {
    try {
      const [todayData, allData] = await Promise.all([
        devotionalService.getTodayDevotional().catch(() => null),
        devotionalService.getDevotionals(),
      ]);
      setTodayDevotional(todayData);
      setDevotionals(allData);
    } catch (error) {
      console.error('Failed to load devotionals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderDevotional = ({ item }: { item: Devotional }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardIcon}>📖</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardScripture}>{item.scripture}</Text>
        <Text style={styles.cardContent} numberOfLines={3}>
          {item.content}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {todayDevotional && (
        <ScrollView style={styles.todayCard}>
          <Text style={styles.todayBadge}>Today's Devotional</Text>
          <Text style={styles.todayTitle}>{todayDevotional.title}</Text>
          <Text style={styles.todayScripture}>{todayDevotional.scripture}</Text>
          <Text style={styles.todayContent}>{todayDevotional.content}</Text>
        </ScrollView>
      )}

      <FlatList
        data={devotionals}
        renderItem={renderDevotional}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadDevotionals();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>No devotionals available</Text>
          </View>
        }
      />
    </View>
  );
}

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
  todayCard: {
    backgroundColor: '#3b82f6',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    maxHeight: 300,
  },
  todayBadge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  todayTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  todayScripture: {
    color: '#e0e7ff',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  todayContent: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardScripture: {
    fontSize: 12,
    color: '#3b82f6',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
});
