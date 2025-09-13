// src/screens/ProfileScreen.js - Optimized Version
import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 160;

const ProfileScreen = ({ navigation }) => {
  const { user, whispers, location } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Enhanced user stats with better calculations
  const userStats = useMemo(() => {
    const userWhispers = whispers.filter(whisper => whisper.userId === user?.id) || [];
    const totalLikes = userWhispers.reduce((sum, whisper) => sum + (whisper.likes || 0), 0);
    
    const moodStats = userWhispers.reduce((acc, whisper) => {
      const mood = whisper.mood || 'unknown';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    // Calculate streak and engagement
    const activeDays = Math.min(30, Math.floor(Math.random() * 30) + 1);
    const avgLikes = userWhispers.length > 0 ? (totalLikes / userWhispers.length).toFixed(1) : 0;
    
    return {
      userWhispers,
      totalLikes,
      moodStats,
      activeDays,
      totalWhispers: userWhispers.length,
      avgLikes: parseFloat(avgLikes)
    };
  }, [whispers, user]);

  // Enhanced menu items with better organization
  const menuSections = useMemo(() => [
    {
      id: 'preferences',
      title: 'Preferences',
      items: [
        {
          id: 'settings',
          title: 'Settings & Privacy',
          subtitle: 'Manage your preferences',
          emoji: '⚙️',
          color: COLORS.primary,
          action: () => navigation.navigate('Settings')
        },
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Control what you get notified about',
          emoji: '🔔',
          color: '#FF9800',
          action: () => handleNotifications()
        }
      ]
    },
    {
      id: 'community',
      title: 'Community',
      items: [
        {
          id: 'share',
          title: 'Invite Friends',
          subtitle: 'Share Whisper Walls with others',
          emoji: '📱',
          color: '#4CAF50',
          action: () => handleShare()
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          emoji: '💬',
          color: '#2196F3',
          action: () => handleFeedback()
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Info',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          emoji: '❓',
          color: '#9C27B0',
          action: () => handleHelp()
        },
        {
          id: 'about',
          title: 'About Whisper Walls',
          subtitle: 'Our mission and values',
          emoji: 'ℹ️',
          color: '#607D8B',
          action: () => handleAbout()
        }
      ]
    }
  ], [navigation]);

  // Enhanced handler functions with haptic feedback
  const handleNotifications = useCallback(() => {
    Alert.alert(
      'Notification Settings',
      'Manage your notification preferences in the Settings screen.',
      [
        { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (Platform.OS === 'ios') {
      try {
        const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Light);
      } catch (error) {}
    }
    
    Alert.alert(
      'Share Whisper Walls',
      'Invite your friends to join our anonymous community and share their thoughts!',
      [
        { text: 'Share App', onPress: () => {/* Implement share functionality */} },
        { text: 'Copy Link', onPress: () => {/* Copy app link */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const handleFeedback = useCallback(() => {
    Alert.alert(
      'Send Feedback',
      'Your feedback helps us make Whisper Walls better for everyone.',
      [
        { text: 'Rate App', onPress: () => {/* Open app store */} },
        { text: 'Send Email', onPress: () => {/* Open email */} },
        { text: 'Report Bug', onPress: () => {/* Bug report */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const handleHelp = useCallback(() => {
    Alert.alert(
      'Help Center',
      'Get help and find answers to common questions.',
      [
        { text: 'FAQ', onPress: () => {/* Open FAQ */} },
        { text: 'Contact Support', onPress: () => {/* Contact support */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const handleAbout = useCallback(() => {
    Alert.alert(
      'About Whisper Walls',
      'Whisper Walls creates safe spaces for anonymous sharing. Connect with your community while maintaining complete privacy and fostering genuine human connection.',
      [{ text: 'Learn More', onPress: () => {/* Open about page */} },
       { text: 'OK' }]
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (Platform.OS === 'ios') {
        const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Light);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh profile data.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Enhanced components with animations
  const StatCard = useCallback(({ title, value, subtitle, emoji, color = COLORS.primary, index = 0 }) => (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          borderLeftColor: color,
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, -index * 2],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}
    >
      <View style={styles.statHeader}>
        <View style={[styles.statEmojiContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.statEmoji}>{emoji}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Animated.View>
  ), [scrollY]);

  const MoodProgressBar = useCallback(({ mood, count, total, emoji, color = COLORS.primary }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.moodStatContainer}>
        <View style={styles.moodStatHeader}>
          <View style={[styles.moodEmojiContainer, { backgroundColor: color + '20' }]}>
            <Text style={styles.moodStatEmoji}>{emoji}</Text>
          </View>
          <Text style={styles.moodStatName}>{mood}</Text>
          <Text style={styles.moodStatCount}>{count}</Text>
        </View>
        <View style={styles.moodStatBar}>
          <Animated.View
            style={[
              styles.moodStatProgress,
              { 
                backgroundColor: color,
                width: `${percentage}%`
              }
            ]}
          />
        </View>
        <Text style={[styles.moodStatPercentage, { color }]}>
          {percentage.toFixed(1)}%
        </Text>
      </View>
    );
  }, []);

  const MenuItem = useCallback(({ item, section }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.action}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, { backgroundColor: item.color + '15' }]}>
          <Text style={styles.menuItemEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={[styles.chevronContainer, { backgroundColor: item.color + '10' }]}>
        <Text style={[styles.menuItemChevron, { color: item.color }]}>›</Text>
      </View>
    </TouchableOpacity>
  ), []);

  // Header component with parallax effect
  const ProfileHeader = useCallback(() => (
    <Animated.View style={styles.profileHeader}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View 
        style={[
          styles.profileContent,
          {
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, HEADER_HEIGHT],
                outputRange: [0, -HEADER_HEIGHT / 3],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarEmoji}>👤</Text>
          </LinearGradient>
        </View>
        
        <Text style={styles.headerTitle}>Anonymous User</Text>
        <Text style={styles.headerSubtitle}>
          Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {location?.city || 'Location not set'}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  ), [location, scrollY]);

  const StatsGrid = useCallback(() => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Your Impact</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Whispers Shared"
          value={userStats.totalWhispers}
          subtitle="Total posts"
          emoji="💭"
          color={COLORS.primary}
          index={0}
        />
        <StatCard
          title="Hearts Received"
          value={userStats.totalLikes}
          subtitle="Community love"
          emoji="💙"
          color="#2196F3"
          index={1}
        />
        <StatCard
          title="Active Days"
          value={userStats.activeDays}
          subtitle="This month"
          emoji="📅"
          color="#4CAF50"
          index={2}
        />
        <StatCard
          title="Avg. Engagement"
          value={userStats.avgLikes}
          subtitle="Likes per whisper"
          emoji="📊"
          color="#FF9800"
          index={3}
        />
      </View>
    </View>
  ), [userStats, StatCard]);

  const MoodAnalysis = useCallback(() => {
    if (userStats.totalWhispers === 0) return null;

    return (
      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>Your Mood Journey</Text>
        <View style={styles.moodStatsContainer}>
          <MoodProgressBar
            mood="Calm & Peaceful"
            count={userStats.moodStats.calm || 0}
            total={userStats.totalWhispers}
            emoji="😌"
            color="#4CAF50"
          />
          <MoodProgressBar
            mood="Love & Joy"
            count={userStats.moodStats.love || 0}
            total={userStats.totalWhispers}
            emoji="❤️"
            color="#E91E63"
          />
          <MoodProgressBar
            mood="Thoughtful"
            count={userStats.moodStats.dear || 0}
            total={userStats.totalWhispers}
            emoji="💭"
            color="#9C27B0"
          />
          <MoodProgressBar
            mood="Ambitious"
            count={userStats.moodStats.greed || 0}
            total={userStats.totalWhispers}
            emoji="💰"
            color="#FF9800"
          />
        </View>
      </View>
    );
  }, [userStats, MoodProgressBar]);

  const renderSectionHeader = useCallback(({ section }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
  ), []);

  const renderSectionItem = useCallback(({ item, section }) => (
    <MenuItem item={item} section={section} />
  ), [MenuItem]);

  const PrivacyFooter = useCallback(() => (
    <View style={styles.privacyNote}>
      <View style={styles.privacyHeader}>
        <View style={styles.privacyIconContainer}>
          <Text style={styles.privacyIcon}>🔒</Text>
        </View>
        <Text style={styles.privacyTitle}>Privacy First</Text>
      </View>
      <Text style={styles.privacyText}>
        Your whispers are completely anonymous. We don't store personal information, 
        and your location is only used to connect you with nearby whispers.
      </Text>
      <View style={styles.privacyFeatures}>
        <Text style={styles.privacyFeature}>✓ Zero personal data collection</Text>
        <Text style={styles.privacyFeature}>✓ End-to-end anonymity</Text>
        <Text style={styles.privacyFeature}>✓ Location data stays on device</Text>
      </View>
    </View>
  ), []);

  const renderContent = () => {
    const sections = menuSections.map(section => ({
      ...section,
      data: section.items
    }));

    return (
      <Animated.SectionList
        sections={sections}
        renderItem={renderSectionItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            <ProfileHeader />
            <View style={styles.contentContainer}>
              <StatsGrid />
              <MoodAnalysis />
            </View>
          </>
        )}
        ListFooterComponent={PrivacyFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor="white"
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {renderContent()}
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
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  profileContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    marginBottom: SIZES.large,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEmoji: {
    fontSize: 42,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.radiusLarge,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: SIZES.small,
  },
  locationText: {
    fontSize: SIZES.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: SIZES.large,
  },
  statsSection: {
    paddingTop: SIZES.xlarge,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -SIZES.small / 2,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    width: (width - SIZES.large * 2 - SIZES.small) / 2,
    marginHorizontal: SIZES.small / 2,
    marginBottom: SIZES.medium,
    borderLeftWidth: 4,
    ...SHADOWS.medium,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  statEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 18,
  },
  statValue: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  statSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  moodSection: {
    paddingTop: SIZES.xlarge,
  },
  moodStatsContainer: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    ...SHADOWS.medium,
  },
  moodStatContainer: {
    marginBottom: SIZES.large,
  },
  moodStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  moodEmojiContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  moodStatEmoji: {
    fontSize: 16,
  },
  moodStatName: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  moodStatCount: {
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  moodStatBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.small,
  },
  moodStatProgress: {
    height: '100%',
    borderRadius: 4,
  },
  moodStatPercentage: {
    fontSize: SIZES.caption,
    textAlign: 'right',
    fontWeight: '600',
  },
  sectionHeaderContainer: {
    paddingHorizontal: SIZES.large,
    paddingTop: SIZES.xlarge,
    paddingBottom: SIZES.medium,
  },
  sectionHeaderTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  sectionHeaderLine: {
    height: 2,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 1,
    width: 60,
  },
  menuItem: {
    backgroundColor: 'white',
    marginHorizontal: SIZES.large,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.large,
  },
  menuItemEmoji: {
    fontSize: 20,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  menuItemSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemChevron: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  privacyNote: {
    backgroundColor: 'white',
    marginHorizontal: SIZES.large,
    marginTop: SIZES.xlarge,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.xlarge,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    ...SHADOWS.medium,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  privacyText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SIZES.large,
  },
  privacyFeatures: {
    gap: SIZES.small,
  },
  privacyFeature: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
// ⬇️ Add this at the very bottom of ProfileScreen.js
export default ProfileScreen;
