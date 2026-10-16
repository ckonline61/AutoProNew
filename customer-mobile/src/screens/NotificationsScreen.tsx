import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = () => {
  const { notifications, markRead, loading, refresh } = useCustomerData();
  const handleMarkAsRead = (id: string) => { void markRead(id).catch(error => Alert.alert('Update failed', requestError(error))); };
  const handleMarkAllRead = () => { void markRead().catch(error => Alert.alert('Update failed', requestError(error))); };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        refreshing={loading}
        onRefresh={() => void refresh()}
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
            onPress={() => handleMarkAsRead(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.topRow}>
              <View style={styles.titleContainer}>
                {!item.isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                  {item.title}
                </Text>
              </View>
              <Text style={styles.timestamp}>{item.createdAt}</Text>
            </View>
            <Text style={styles.notifMessage}>{item.message}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>Booking alerts and car tips will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  notifCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifCardUnread: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BFDBFE',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: '#1E3A8A',
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  notifMessage: {
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
