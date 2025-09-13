// src/screens/ProfileScreen.js
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, whispers, location } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  // Memoized calculations for better performance
  const userStats = useMemo(() => {
    const userWhispers = whispers.filter(whisper => whisper.userId === user?.id) || [];
    const totalLikes = userWhispers.reduce((sum, whisper) => sum + (whisper.likes || 0), 0);
    
    const moodStats = userWhispers.reduce((acc, whisper) => {
      const mood = whisper.mood || 'unknown';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    // Calculate active days (mock for now)
    const activeDays = Math.min(30, Math.floor(Math.random() * 30) + 1);

    return {
      userWhispers,
      totalLikes,
      moodStats,
      activeDays,
      totalWhispers: userWhispers.length
    };
  }, [whispers, user]);

  const menuItems = useMemo(() => [
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      emoji: '⚙️',
      action: () => navigation.navigate('Settings')
    },
    {
      id: 'about',
      title: 'About Whisper Walls',
      subtitle: 'Learn more about our mission',
      emoji: 'ℹ️',
      action: () => handleAbout()
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs and contact information',
      emoji: '❓',
      action: () => handleHelp()
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve the app',
      emoji: '💬',
      action: () => handleFeedback()
    },
    {
      id: 'share',
      title: 'Share App',
      subtitle: 'Invite friends to join',
      emoji: '📱',
      action: () => handleShare()
    }
  ], [navigation]);

  const handleAbout = useCallback(() => {
    Alert.alert(
      'About Whisper Walls',
      'Whisper Walls is a platform for anonymous, location-based sharing of thoughts and feelings. Connect with your community while maintaining complete privacy.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleHelp = useCallback(() => {
    Alert.alert(
      'Help & Support',
      'Need help? Visit our support center or contact us at support@whisperwalls.com',
      [
        { text: 'Contact Support', onPress: () => {/* Open email */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const handleFeedback = useCallback(() => {
    Alert.alert(
      'Send Feedback',
      'We\'d love to hear your thoughts! Your feedback helps us improve the app.',
      [
        { text: 'Write Review', onPress: () => {/* Open app store */} },
        { text: 'Send Email', onPress: () => {/* Open email */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const handleShare = useCallback(() => {
    Alert.alert(
      'Share Whisper Walls',
      'Share the app with your friends and help grow our anonymous community!',
      [
        { text: 'Share', onPress: () => {/* Open share */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh profile data.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const StatCard = useCallback(({ title, value, subtitle, emoji, color = COLORS.primary }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statEmoji}>{emoji}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  ), []);

  const MoodStatBar = useCallback(({ mood, count, total, emoji, color = COLORS.primary }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.moodStatContainer}>
        <View style={styles.moodStatHeader}>
          <Text style={styles.moodStatEmoji}>{emoji}</Text>
          <Text style={styles.moodStatName}>{mood}</Text>
          <Text style={styles.moodStatCount}>{count}</Text>
        </View>
        <View style={styles.moodStatBar}>
          <LinearGradient
            colors={[color, `${color}80`]}
            style={[styles.moodStatProgress, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={styles.moodStatPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  }, []);

  const MenuItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Text style={styles.menuItemChevron}>›</Text>
    </TouchableOpacity>
  ), []);

  const renderStatsGrid = useCallback(() => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Whispers"
          value={userStats.totalWhispers}
          subtitle="Total shared"
          emoji="💭"
          color={COLORS.primary}
        />
        <StatCard
          title="Likes"
          value={userStats.totalLikes}
          subtitle="Received"
          emoji="💙"
          color="#2196F3"
        />
        <StatCard
          title="Days"
          value={userStats.activeDays}
          subtitle="Active"
          emoji="📅"
          color="#4CAF50"
        />
        <StatCard
          title="Radius"
          value="2km"
          subtitle="Current"
          emoji="📍"
          color="#FF9800"
        />
      </View>
    </View>
  ), [userStats]);

  const renderMoodAnalysis = useCallback(() => {
    if (userStats.totalWhispers === 0) return null;

    return (
      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>Your Mood Distribution</Text>
        <View style={styles.moodStatsContainer}>
          <MoodStatBar
            mood="Calm"
            count={userStats.moodStats.calm || 0}
            total={userStats.totalWhispers}
            emoji="😌"
            color="#4CAF50"
          />
          <MoodStatBar
            mood="Love"
            count={userStats.moodStats.love || 0}
            total={userStats.totalWhispers}
            emoji="❤️"
            color="#E91E63"
          />
          <MoodStatBar
            mood="Thoughtful"
            count={userStats.moodStats.dear || 0}
            total={userStats.totalWhispers}
            emoji="💭"
            color="#9C27B0"
          />
          <MoodStatBar
            mood="Ambitious"
            count={userStats.moodStats.greed || 0}
            total={userStats.totalWhispers}
            emoji="💰"
            color="#FF9800"
          />
        </View>
      </View>
    );
  }, [userStats]);

  const renderHeader = useCallback(() => (
    <>
      {/* Profile Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.profileHeader}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.headerTitle}>Anonymous User</Text>
        <Text style={styles.headerSubtitle}>
          Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Text style={styles.locationText}>
          📍 {location?.city || 'Location not set'}
        </Text>
      </LinearGradient>

      {/* Stats and Mood Analysis */}
      {renderStatsGrid()}
      {renderMoodAnalysis()}

      {/* Menu Section Header */}
      <View style={styles.menuSectionHeader}>
        <Text style={styles.sectionTitle}>More Options</Text>
      </View>
    </>
  ), [location, renderStatsGrid, renderMoodAnalysis]);

  const renderFooter = useCallback(() => (
    <View style={styles.privacyNote}>
      <Text style={styles.privacyTitle}>🔒 Privacy First</Text>
      <Text style={styles.privacyText}>
        Your whispers are completely anonymous. We don't store your personal information, 
        and your location is only used to find nearby whispers.
      </Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <FlatList
        data={menuItems}
        renderItem={({ item }) => <MenuItem item={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={{
          refreshing,
          onRefresh,
          colors: [COLORS.primary],
          tintColor: COLORS.primary
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SIZES.xlarge,
  },
  profileHeader: {
    paddingTop: 50,
    paddingBottom: SIZES.xlarge,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SIZES.base,
  },
  headerSubtitle: {
    fontSize: SIZES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SIZES.base,
  },
  locationText: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsSection: {
    paddingHorizontal: SIZES.large,
    paddingTop: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    width: (width - SIZES.large * 2 - SIZES.small) / 2,
    marginBottom: SIZES.medium,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  moodSection: {
    paddingHorizontal: SIZES.large,
    paddingTop: SIZES.large,
  },
  moodStatsContainer: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    ...SHADOWS.small,
  },
  moodStatContainer: {
    marginBottom: SIZES.medium,
  },
  moodStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  moodStatEmoji: {
    fontSize: 16,
    marginRight: SIZES.small,
  },
  moodStatName: {
    flex: 1,
    fontSize: SIZES.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  moodStatCount: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginRight: SIZES.small,
  },
  moodStatBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.base,
  },
  moodStatProgress: {
    height: '100%',
    borderRadius: 3,
  },
  moodStatPercentage: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  menuSectionHeader: {
    paddingHorizontal: SIZES.large,
    paddingTop: SIZES.large,
  },
  menuItem: {
    backgroundColor: 'white',
    marginHorizontal: SIZES.large,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  menuItemEmoji: {
    fontSize: 18,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  menuItemChevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  privacyNote: {
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    marginHorizontal: SIZES.large,
    marginTop: SIZES.large,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  privacyTitle: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  privacyText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});

export default ProfileScreen;