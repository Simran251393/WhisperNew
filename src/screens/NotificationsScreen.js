// src/screens/NotificationsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatTimestamp } from '../utils/helpers';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'like',
      title: 'Your whisper received a like',
      message: 'Someone liked your calm whisper about finding peace',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      emoji: '💙'
    },
    {
      id: '2',
      type: 'nearby',
      title: 'New whispers nearby',
      message: '3 new whispers in your area',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      emoji: '📍'
    },
    {
      id: '3',
      type: 'trending',
      title: 'Your whisper is trending',
      message: 'Your love whisper is getting lots of attention',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      emoji: '🔥'
    },
    {
      id: '4',
      type: 'weekly',
      title: 'Weekly Summary',
      message: 'Your whispers received 25 likes this week',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      emoji: '📊'
    }
  ]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationItem = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => markAsRead(notification.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationEmoji}>{notification.emoji}</Text>
          <View style={styles.notificationTextContainer}>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </View>
          {!notification.read && (
            <View style={styles.unreadDot} />
          )}
        </View>
        <Text style={styles.notificationTime}>
          {formatTimestamp(notification.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          <>
            {unreadCount > 0 && (
              <View style={styles.markAllSection}>
                <TouchableOpacity
                  style={styles.markAllFullButton}
                  onPress={markAllAsRead}
                >
                  <Text style={styles.markAllFullButtonText}>
                    Mark all as read ({unreadCount})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.notificationsList}>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🔔</Text>
            <Text style={styles.emptyStateTitle}>No notifications yet</Text>
            <Text style={styles.emptyStateDescription}>
              You'll see notifications here when people interact with your whispers
              or when there are new whispers in your area.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.medium,
    paddingHorizontal: SIZES.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: SIZES.h3,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: SIZES.small,
  },
  unreadBadgeText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.large,
  },
  markAllSection: {
    paddingVertical: SIZES.medium,
  },
  markAllFullButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLarge,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    alignItems: 'center',
  },
  markAllFullButtonText: {
    color: 'white',
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  notificationsList: {
    paddingBottom: SIZES.xlarge,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.small,
  },
  notificationEmoji: {
    fontSize: 20,
    marginRight: SIZES.medium,
    marginTop: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SIZES.small,
    marginTop: 6,
  },
  notificationTime: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.xlarge,
    marginTop: SIZES.xlarge,
    ...SHADOWS.medium,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: SIZES.large,
  },
  emptyStateTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;