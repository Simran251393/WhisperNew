// src/screens/HomeScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import WhisperCard from '../components/WhisperCard';
import MoodSelector from '../components/MoodSelector';

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

  // Memoize filtered whispers to prevent unnecessary re-renders
  const filteredWhispers = useMemo(() => getFilteredWhispers(), [
    selectedMood, 
    location
  ]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Add any focus-based refresh logic here
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Add actual refresh logic here (API calls, data updates)
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location. Please check permissions.');
    } finally {
      setLoadingLocation(false);
    }
  }, [loadingLocation, requestLocationPermission]);

  const handleAddWhisper = useCallback(() => {
    navigation.navigate('AddWhisper');
  }, [navigation]);

  const handleNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  const handleLikeWhisper = useCallback((whisperId) => {
    likeWhisper(whisperId);
  }, [likeWhisper]);

  const renderWhisperItem = useCallback(({ item }) => (
    <WhisperCard
      whisper={item}
      onLike={handleLikeWhisper}
    />
  ), [handleLikeWhisper]);

  const renderHeader = useCallback(() => (
    <>
      {/* Location Section */}
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Your Location</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleLocationPress}
          disabled={loadingLocation}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.primary]}
            style={styles.locationButtonGradient}
          >
            {loadingLocation ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.locationButtonText}>
                📍 {location ? location.city : 'Use My Location'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Mood Filter Section */}
      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>Filter by Mood</Text>
        <MoodSelector
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
        />
      </View>

      {/* Feed Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>
          Whispers Near You ({selectedMood ? `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Mood` : 'All Moods'})
        </Text>
        <Text style={styles.feedCount}>
          {filteredWhispers.length} whispers
        </Text>
      </View>
    </>
  ), [
    location,
    loadingLocation,
    selectedMood,
    filteredWhispers.length,
    handleLocationPress,
    setSelectedMood
  ]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateEmoji}>💭</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No whispers here yet</Text>
      <Text style={styles.emptyStateDescription}>
        Be the first to share your thoughts in this area!
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={handleAddWhisper}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primaryLight, COLORS.primary]}
          style={styles.emptyStateButtonGradient}
        >
          <Text style={styles.emptyStateButtonText}>
            ✨ Add First Whisper
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  ), [handleAddWhisper]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading whispers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🏮</Text>
            </View>
            <Text style={styles.logoText}>Whisper Walls</Text>
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleNotifications}
            activeOpacity={0.8}
          >
            <Text style={styles.headerButtonText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Whispers Feed */}
      <FlatList
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
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * index,
          index,
        })}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddWhisper}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primaryLight, COLORS.primary]}
          style={styles.floatingButtonGradient}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.medium,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SIZES.medium,
    paddingHorizontal: SIZES.large,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.small,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: 'white',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: SIZES.large,
    paddingBottom: 100, // Space for floating button
  },
  locationSection: {
    backgroundColor: 'white',
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.medium,
    marginVertical: SIZES.medium,
    borderRadius: SIZES.radiusMedium,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  locationButton: {
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
  },
  locationButtonGradient: {
    paddingVertical: SIZES.medium,
    alignItems: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: SIZES.body,
    fontWeight: '500',
  },
  moodSection: {
    backgroundColor: 'white',
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    borderRadius: SIZES.radiusMedium,
    ...SHADOWS.small,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.small,
  },
  feedTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  feedCount: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.xlarge,
    marginTop: SIZES.xlarge,
    ...SHADOWS.medium,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  emptyStateEmoji: {
    fontSize: 40,
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
    marginBottom: SIZES.large,
  },
  emptyStateButton: {
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.xlarge,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;