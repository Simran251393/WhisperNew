// src/screens/HomeScreen.js - Optimized Version
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import WhisperCard from '../components/WhisperCard';
import MoodSelector from '../components/MoodSelector';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 90;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const HomeScreen = ({ navigation }) => {
  const {
    location,
    selectedMood,
    setSelectedMood,
    getFilteredWhispers,
    likeWhisper,
    requestLocationPermission,
    isLoading
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const scrollY = new Animated.Value(0);

  // Animated header values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  // Optimized filtered whispers with caching
  const filteredWhispers = useMemo(() => {
    const whispers = getFilteredWhispers();
    return whispers.slice(0, 20); // Limit initial render for performance
  }, [selectedMood, location]);

  // Enhanced refresh with haptic feedback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (Platform.OS === 'ios') {
        const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Light);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to refresh content. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLocationPress = useCallback(async () => {
    if (loadingLocation) return;
    setLoadingLocation(true);
    try {
      await requestLocationPermission();
      if (Platform.OS === 'ios') {
        const { notificationAsync, NotificationFeedbackType } = await import('expo-haptics');
        notificationAsync(NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location. Please check permissions.');
    } finally {
      setLoadingLocation(false);
    }
  }, [loadingLocation, requestLocationPermission]);

  const handleAddWhisper = useCallback(() => {
    navigation.navigate('AddWhisper');
  }, [navigation]);

  const handleLikeWhisper = useCallback((whisperId) => {
    likeWhisper(whisperId);
    if (Platform.OS === 'ios') {
      import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
        impactAsync(ImpactFeedbackStyle.Light);
      });
    }
  }, [likeWhisper]);

  const renderWhisperItem = useCallback(({ item, index }) => (
    <Animated.View
      style={[
        styles.whisperItemContainer,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0.95],
            extrapolate: 'clamp',
          }),
        },
      ]}
    >
      <WhisperCard
        whisper={item}
        onLike={handleLikeWhisper}
        index={index}
      />
    </Animated.View>
  ), [handleLikeWhisper, scrollY]);

  const MoodFilterSection = useCallback(() => (
    <View style={styles.moodSection}>
      <Text style={styles.sectionTitle}>How are you feeling?</Text>
      <MoodSelector
        selectedMood={selectedMood}
        onMoodSelect={setSelectedMood}
        style={styles.moodSelector}
      />
    </View>
  ), [selectedMood, setSelectedMood]);

  const LocationSection = useCallback(() => (
    <View style={styles.locationSection}>
      <View style={styles.locationHeader}>
        <Text style={styles.locationLabel}>Sharing from</Text>
        <TouchableOpacity
          style={styles.locationRefreshButton}
          onPress={handleLocationPress}
          disabled={loadingLocation}
          activeOpacity={0.7}
        >
          {loadingLocation ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.locationContent}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>
          {location ? location.city : 'Getting your location...'}
        </Text>
      </View>
      {location && (
        <Text style={styles.locationRange}>
          Showing whispers within 2km radius
        </Text>
      )}
    </View>
  ), [location, loadingLocation, handleLocationPress]);

  const StatsOverview = useCallback(() => (
    <View style={styles.statsSection}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{filteredWhispers.length}</Text>
        <Text style={styles.statLabel}>Nearby</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>12</Text>
        <Text style={styles.statLabel}>Active Now</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {selectedMood ? selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1) : 'All'}
        </Text>
        <Text style={styles.statLabel}>Mood</Text>
      </View>
    </View>
  ), [filteredWhispers.length, selectedMood]);

  const renderHeader = useCallback(() => (
    <View style={styles.contentHeader}>
      <LocationSection />
      <MoodFilterSection />
      <StatsOverview />
    </View>
  ), [LocationSection, MoodFilterSection, StatsOverview]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <LinearGradient
          colors={[COLORS.primaryLight + '20', COLORS.primary + '20']}
          style={styles.emptyStateIconGradient}
        >
          <Text style={styles.emptyStateIcon}>💭</Text>
        </LinearGradient>
      </View>
      <Text style={styles.emptyStateTitle}>No whispers nearby</Text>
      <Text style={styles.emptyStateDescription}>
        Be the first to share your thoughts in this area and start the conversation!
      </Text>
      <TouchableOpacity
        style={styles.emptyActionButton}
        onPress={handleAddWhisper}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primaryLight, COLORS.primary]}
          style={styles.emptyActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emptyActionText}>✨ Share First Whisper</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  ), [handleAddWhisper]);

  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, []);

  const getItemLayout = useCallback((data, index) => ({
    length: 200,
    offset: 200 * index,
    index,
  }), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.primaryLight + '10', COLORS.primary + '10']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding whispers near you...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View 
          style={[
            styles.headerContent, 
            { opacity: headerOpacity, transform: [{ scale: titleScale }] }
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🗯️</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>Whisper Walls</Text>
              <Text style={styles.logoSubtext}>Anonymous sharing</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      {/* Main Content */}
      <Animated.FlatList
        data={filteredWhispers}
        renderItem={renderWhisperItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor="white"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={getItemLayout}
        updateCellsBatchingPeriod={100}
      />
      {/* Floating Button */}
      <Animated.View
        style={[
          styles.floatingButtonContainer,
          {
            transform: [{
              scale: scrollY.interpolate({
                inputRange: [0, 100, 200],
                outputRange: [1, 0.8, 1],
                extrapolate: 'clamp',
              }),
            }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddWhisper}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.primary]}
            style={styles.floatingButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </LinearGradient>
          <View style={styles.pulseRing} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingGradient: { padding: SIZES.xlarge * 2, borderRadius: SIZES.radiusLarge, alignItems: 'center', margin: SIZES.large },
  loadingText: { marginTop: SIZES.large, fontSize: SIZES.h5, color: COLORS.primary, fontWeight: '500' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, paddingTop: 50, paddingHorizontal: SIZES.large, elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  headerContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.25)', justifyContent: 'center', alignItems: 'center', marginRight: SIZES.medium, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
  logoEmoji: { fontSize: 20 },
  logoTextContainer: { justifyContent: 'center' },
  logoText: { fontSize: SIZES.h4, fontWeight: 'bold', color: 'white', letterSpacing: 0.5 },
  logoSubtext: { fontSize: SIZES.small, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '400' },
  notificationButton: { position: 'relative' },
  notificationBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
  notificationIcon: { fontSize: 18 },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444', borderWidth: 1, borderColor: 'white' },
  listContent: { paddingTop: HEADER_MAX_HEIGHT + SIZES.medium, paddingHorizontal: SIZES.large, paddingBottom: 120 },
  contentHeader: { paddingBottom: SIZES.large },
  locationSection: { backgroundColor: 'white', borderRadius: SIZES.radiusLarge, padding: SIZES.large, marginBottom: SIZES.large, ...SHADOWS.medium },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.medium },
  locationLabel: { fontSize: SIZES.caption, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  locationRefreshButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  refreshIcon: { fontSize: 16, color: COLORS.primary },
  locationContent: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.small },
  locationIcon: { fontSize: 20, marginRight: SIZES.small },
  locationText: { fontSize: SIZES.h4, color: COLORS.text, fontWeight: '600', flex: 1 },
  locationRange: { fontSize: SIZES.small, color: COLORS.textLight, fontStyle: 'italic' },
  moodSection: { backgroundColor: 'white', borderRadius: SIZES.radiusLarge, padding: SIZES.large, marginBottom: SIZES.large, ...SHADOWS.medium },
  sectionTitle: { fontSize: SIZES.h5, fontWeight: '600', color: COLORS.text, marginBottom: SIZES.large },
  moodSelector: { marginTop: SIZES.small },
  statsSection: { backgroundColor: 'white', borderRadius: SIZES.radiusLarge, padding: SIZES.large, marginBottom: SIZES.large, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', ...SHADOWS.medium },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.primary, marginBottom: SIZES.base },
  statLabel: { fontSize: SIZES.small, color: COLORS.textMuted, fontWeight: '500', textAlign: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.lightGray },
  whisperItemContainer: { marginBottom: SIZES.medium },
  emptyState: { alignItems: 'center', backgroundColor: 'white', borderRadius: SIZES.radiusXLarge, padding: SIZES.xlarge * 1.5, marginTop: SIZES.xlarge, ...SHADOWS.large },
  emptyStateIconContainer: { marginBottom: SIZES.xlarge },
  emptyStateIconGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  emptyStateIcon: { fontSize: 48 },
  emptyStateTitle: { fontSize: SIZES.h3, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.medium, textAlign: 'center' },
  emptyStateDescription: { fontSize: SIZES.body, color: COLORS.textLight, textAlign: 'center', lineHeight: 24, marginBottom: SIZES.xlarge, paddingHorizontal: SIZES.medium },
  emptyActionButton: { borderRadius: SIZES.radiusXLarge, overflow: 'hidden', elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  emptyActionGradient: { paddingVertical: SIZES.large, paddingHorizontal: SIZES.xlarge * 2, alignItems: 'center' },
  emptyActionText: { color: 'white', fontWeight: '600', fontSize: SIZES.h5 },
  floatingButtonContainer: { position: 'absolute', bottom: 30, right: 30, zIndex: 100 },
  floatingButton: { width: 64, height: 64, borderRadius: 32, overflow: 'visible', justifyContent: 'center', alignItems: 'center' },
  floatingButtonGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  floatingButtonText: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  pulseRing: { position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary + '30' },
});

export default HomeScreen;
