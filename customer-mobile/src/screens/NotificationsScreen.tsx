import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, TabPills, TabPillItem } from '../components/ui';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { Notification } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

type NotificationFilter = 'ALL' | 'BOOKINGS' | 'PAYMENTS' | 'OFFERS';

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { notifications, markRead, loading, refresh } = useCustomerData();
  const [activeTab, setActiveTab] = useState<NotificationFilter>('ALL');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleMarkAsRead = (id: string) => {
    void markRead(id).catch((error) =>
      Alert.alert('Update failed', requestError(error))
    );
  };

  const handleMarkAllRead = () => {
    void markRead().catch((error) =>
      Alert.alert('Update failed', requestError(error))
    );
  };

  // Filter notifications based on tab
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'ALL') return true;

      const title = item.title.toLowerCase();
      const message = item.message.toLowerCase();

      if (activeTab === 'BOOKINGS') {
        return (
          item.type === 'BOOKING' ||
          title.includes('service') ||
          title.includes('booking') ||
          title.includes('mechanic')
        );
      }

      if (activeTab === 'PAYMENTS') {
        return (
          title.includes('paid') ||
          title.includes('payment') ||
          title.includes('invoice') ||
          message.includes('paid') ||
          message.includes('payment') ||
          message.includes('₹')
        );
      }

      if (activeTab === 'OFFERS') {
        return (
          item.type === 'MARKETPLACE' ||
          title.includes('offer') ||
          title.includes('discount') ||
          title.includes('sale') ||
          title.includes('deal') ||
          message.includes('offer') ||
          message.includes('discount')
        );
      }

      return true;
    });
  }, [notifications, activeTab]);

  const tabs: TabPillItem[] = [
    { key: 'ALL', label: 'All', count: notifications.length },
    {
      key: 'BOOKINGS',
      label: 'Bookings',
      count: notifications.filter(
        (n) =>
          n.type === 'BOOKING' ||
          n.title.toLowerCase().includes('service') ||
          n.title.toLowerCase().includes('booking')
      ).length,
    },
    {
      key: 'PAYMENTS',
      label: 'Payments',
      count: notifications.filter(
        (n) =>
          n.title.toLowerCase().includes('payment') ||
          n.title.toLowerCase().includes('invoice') ||
          n.message.toLowerCase().includes('₹')
      ).length,
    },
    {
      key: 'OFFERS',
      label: 'Offers',
      count: notifications.filter(
        (n) =>
          n.type === 'MARKETPLACE' ||
          n.title.toLowerCase().includes('offer') ||
          n.message.toLowerCase().includes('offer')
      ).length,
    },
  ];

  const getNotificationVisuals = (item: Notification) => {
    const t = item.type;
    const title = item.title.toLowerCase();

    if (
      title.includes('payment') ||
      title.includes('paid') ||
      title.includes('invoice') ||
      title.includes('refund')
    ) {
      return {
        icon: 'card' as keyof typeof Ionicons.glyphMap,
        bgColor: COLORS.successLight,
        iconColor: COLORS.success,
      };
    }

    if (
      t === 'MARKETPLACE' ||
      title.includes('offer') ||
      title.includes('discount') ||
      title.includes('deal')
    ) {
      return {
        icon: 'pricetag' as keyof typeof Ionicons.glyphMap,
        bgColor: COLORS.primaryLight,
        iconColor: COLORS.primary,
      };
    }

    if (t === 'BOOKING' || title.includes('service') || title.includes('mechanic')) {
      return {
        icon: 'calendar' as keyof typeof Ionicons.glyphMap,
        bgColor: COLORS.infoLight,
        iconColor: COLORS.info,
      };
    }

    return {
      icon: 'notifications' as keyof typeof Ionicons.glyphMap,
      bgColor: COLORS.gray100,
      iconColor: COLORS.gray600,
    };
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="notifications-off-outline" size={42} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        Service booking updates, payment invoices, and special discounts will show up here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
            </Text>
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs using TabPills */}
      <View style={styles.tabSection}>
        <TabPills
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as NotificationFilter)}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void refresh()}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => {
          const { icon, bgColor, iconColor } = getNotificationVisuals(item);

          return (
            <Card
              style={[
                styles.notifCard,
                !item.isRead && styles.notifCardUnread,
              ]}
              padding="md"
              elevation="sm"
              onPress={() => handleMarkAsRead(item.id)}
            >
              <View style={styles.cardInnerRow}>
                {/* Unread Red Dot Indicator on Left */}
                {!item.isRead ? (
                  <View style={styles.unreadDot} />
                ) : (
                  <View style={styles.readDotSpacer} />
                )}

                {/* Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: bgColor },
                  ]}
                >
                  <Ionicons name={icon} size={20} color={iconColor} />
                </View>

                {/* Notification Content */}
                <View style={styles.contentColumn}>
                  <View style={styles.topRow}>
                    <Text
                      style={[
                        styles.notifTitle,
                        !item.isRead && styles.notifTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.timestamp}>{item.createdAt}</Text>
                  </View>

                  <Text style={styles.notifMessage} numberOfLines={3}>
                    {item.message}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  notifCard: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
  },
  notifCardUnread: {
    backgroundColor: '#FFF8F8', // subtle red/white glow for unread
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cardInnerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 14,
    marginRight: 6,
  },
  readDotSpacer: {
    width: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentColumn: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  notifMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
