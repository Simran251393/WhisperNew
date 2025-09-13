// src/screens/ExploreScreen.js
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS, MOODS } from '../constants/theme';
import WhisperCard from '../components/WhisperCard';
import MoodSelector from '../components/MoodSelector';

const ITEMS_PER_PAGE = 10;

const ExploreScreen = ({ navigation }) => {
  const { whispers, likeWhisper, location } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const searchTimeoutRef = useRef(null);

  const categories = useMemo(() => [
    { id: 'popular', name: 'Popular', emoji: '🔥' },
    { id: 'recent', name: 'Recent', emoji: '⏰' },
    { id: 'nearby', name: 'Nearby', emoji: '📍' },
    { id: 'trending', name: 'Trending', emoji: '📈' }
  ], []);

  const getFilteredWhispers = useMemo(() => {
    let filtered = [...whispers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(whisper =>
        whisper.text.toLowerCase().includes(query) ||
        whisper.mood.toLowerCase().includes(query)
      );
    }

    // Apply category filter with error handling
    try {
      switch (selectedCategory) {
        case 'popular':
          filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'recent':
          filtered = filtered.sort((a, b) => {
            const dateA = new Date(a.timestamp || Date.now());
            const dateB = new Date(b.timestamp || Date.now());
            return dateB - dateA;
          });
          break;
        case 'nearby':
          filtered = filtered
            .filter(whisper => (whisper.distance || 0) <= 1000)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
          break;
        case 'trending':
          // Enhanced trending algorithm
          filtered = filtered
            .filter(whisper => {
              const hoursOld = (Date.now() - new Date(whisper.timestamp || Date.now())) / (1000 * 60 * 60);
              return hoursOld <= 24;
            })
            .sort((a, b) => {
              const aLikes = a.likes || 0;
              const bLikes = b.likes || 0;
              const aHours = Math.max(1, (Date.now() - new Date(a.timestamp || Date.now())) / (1000 * 60 * 60));
              const bHours = Math.max(1, (Date.now() - new Date(b.timestamp || Date.now())) / (1000 * 60 * 60));
              
              const aScore = aLikes / aHours;
              const bScore = bLikes / bHours;
              return bScore - aScore;
            });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Filter error:', error);
      // Fallback to simple sort
      filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return filtered.slice(0, page * ITEMS_PER_PAGE);
  }, [whispers, searchQuery, selectedCategory, page]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    setPage(1); // Reset pagination on search
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search for better performance
    searchTimeoutRef.current = setTimeout(() => {
      // Could add analytics here
    }, 300);
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1); // Reset pagination on category change
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && getFilteredWhispers.length === page * ITEMS_PER_PAGE) {
      setLoading(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        setLoading(false);
      }, 500);
    }
  }, [loading, getFilteredWhispers.length, page]);

  const getMoodStats = useMemo(() => {
    if (!whispers.length) return [];
    
    const stats = whispers.reduce((acc, whisper) => {
      const mood = whisper.mood || 'unknown';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    return MOODS.map(mood => ({
      ...mood,
      count: stats[mood.id] || 0,
      percentage: ((stats[mood.id] || 0) / whispers.length * 100)
    })).sort((a, b) => b.count - a.count);
  }, [whispers]);

  const CategoryButton = useCallback(({ category, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isSelected && styles.selectedCategoryButton]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isSelected ? [COLORS.primaryLight, COLORS.primary] : ['transparent', 'transparent']}
        style={styles.categoryButtonGradient}
      >
        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        <Text style={[
          styles.categoryText,
          isSelected && styles.selectedCategoryText
        ]}>
          {category.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const MoodStatsCard = useCallback(({ mood }) => (
    <View style={styles.moodStatCard}>
      <Text style={styles.moodStatEmoji}>{mood.emoji}</Text>
      <Text style={styles.moodStatName}>{mood.name}</Text>
      <Text style={styles.moodStatCount}>{mood.count}</Text>
      <View style={styles.moodStatBar}>
        <View
          style={[
            styles.moodStatProgress,
            { width: `${Math.min(100, mood.percentage)}%` }
          ]}
        />
      </View>
    </View>
  ), []);

  const renderCategoryItem = useCallback(({ item }) => (
    <CategoryButton
      category={item}
      isSelected={selectedCategory === item.id}
      onPress={() => handleCategoryChange(item.id)}
    />
  ), [selectedCategory, handleCategoryChange]);

  const renderMoodItem = useCallback(({ item }) => (
    <MoodStatsCard mood={item} />
  ), []);

  const renderWhisperItem = useCallback(({ item }) => (
    <WhisperCard
      whisper={item}
      onLike={likeWhisper}
    />
  ), [likeWhisper]);

  const renderHeader = useCallback(() => (
    <>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search whispers..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearch}
              onPress={() => handleSearch('')}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          📍 Exploring from: {location?.city || 'Your Location'}
        </Text>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Mood Analytics */}
      <View style={styles.moodAnalyticsSection}>
        <Text style={styles.sectionTitle}>Community Mood Trends</Text>
        <FlatList
          data={getMoodStats}
          renderItem={renderMoodItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodStatsContainer}
        />
      </View>

      {/* Whispers List Header */}
      <View style={styles.whispersSectionHeader}>
        <Text style={styles.sectionTitle}>
          {categories.find(cat => cat.id === selectedCategory)?.name} Whispers
        </Text>
        <Text style={styles.whispersCount}>
          {getFilteredWhispers.length} found
        </Text>
      </View>
    </>
  ), [
    searchQuery,
    location,
    categories,
    getMoodStats,
    selectedCategory,
    getFilteredWhispers.length,
    handleSearch,
    renderCategoryItem,
    renderMoodItem
  ]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [loading]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🔍</Text>
      <Text style={styles.emptyStateTitle}>No whispers found</Text>
      <Text style={styles.emptyStateDescription}>
        {searchQuery.trim() 
          ? `No whispers match "${searchQuery}"`
          : `No ${selectedCategory} whispers available right now`
        }
      </Text>
    </View>
  ), [searchQuery, selectedCategory]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>
            Discover whispers from around the world
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={getFilteredWhispers}
        renderItem={renderWhisperItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        contentContainerStyle={styles.content}
      />
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
    paddingBottom: SIZES.large,
    paddingHorizontal: SIZES.large,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SIZES.base,
  },
  headerSubtitle: {
    fontSize: SIZES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: SIZES.large,
    paddingBottom: SIZES.xlarge,
  },
  searchSection: {
    paddingTop: SIZES.large,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusXLarge,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SIZES.small,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  clearSearch: {
    padding: SIZES.base,
  },
  clearSearchText: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  locationInfo: {
    paddingTop: SIZES.medium,
  },
  locationText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  categoriesSection: {
    paddingTop: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  categoriesContainer: {
    paddingRight: SIZES.large,
  },
  categoryButton: {
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: SIZES.small,
  },
  selectedCategoryButton: {
    borderColor: COLORS.primary,
  },
  categoryButtonGradient: {
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: SIZES.base,
  },
  categoryText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  moodAnalyticsSection: {
    paddingTop: SIZES.large,
  },
  moodStatsContainer: {
    paddingRight: SIZES.large,
  },
  moodStatCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    alignItems: 'center',
    minWidth: 100,
    marginRight: SIZES.small,
    ...SHADOWS.small,
  },
  moodStatEmoji: {
    fontSize: 24,
    marginBottom: SIZES.base,
  },
  moodStatName: {
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SIZES.base,
  },
  moodStatCount: {
    fontSize: SIZES.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  moodStatBar: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  moodStatProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  whispersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.large,
    marginBottom: SIZES.medium,
  },
  whispersCount: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  loadingFooter: {
    paddingVertical: SIZES.large,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.xlarge,
    marginTop: SIZES.medium,
    ...SHADOWS.small,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: SIZES.medium,
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

export default ExploreScreen;