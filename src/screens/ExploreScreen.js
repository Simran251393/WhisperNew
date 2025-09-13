// src/screens/ExploreScreen.js - Optimized Version
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS, MOODS } from '../constants/theme';
import WhisperCard from '../components/WhisperCard';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 140;
const ITEMS_PER_PAGE = 10;

const ExploreScreen = ({ navigation }) => {
  const { whispers, likeWhisper, location } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchTimeoutRef = useRef(null);
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const categories = useMemo(() => [
    { id: 'popular', name: 'Popular', emoji: '🔥', color: '#FF5722' },
    { id: 'recent', name: 'Recent', emoji: '⏰', color: '#2196F3' },
    { id: 'nearby', name: 'Nearby', emoji: '📍', color: '#4CAF50' },
    { id: 'trending', name: 'Trending', emoji: '📈', color: '#9C27B0' }
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
      filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return filtered.slice(0, page * ITEMS_PER_PAGE);
  }, [whispers, searchQuery, selectedCategory, page]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    setPage(1);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      // Analytics could go here
    }, 300);
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
        impactAsync(ImpactFeedbackStyle.Light);
      });
    }
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

  const handleLikeWhisper = useCallback((whisperId) => {
    likeWhisper(whisperId);
    if (Platform.OS === 'ios') {
      import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
        impactAsync(ImpactFeedbackStyle.Light);
      });
    }
  }, [likeWhisper]);

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

  // Enhanced Components
  const Header = useCallback(() => (
    <View style={styles.header}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View 
        style={[
          styles.headerContent,
          {
            opacity: fadeAnimation,
            transform: [{ translateY: slideAnimation }]
          }
        ]}
      >
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>🌍</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Discover whispers worldwide</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  ), [fadeAnimation, slideAnimation]);

  const SearchSection = useCallback(() => (
    <Animated.View 
      style={[
        styles.searchCard,
        {
          opacity: fadeAnimation,
          transform: [{ translateY: slideAnimation }]
        }
      ]}
    >
      <View style={styles.searchHeader}>
        <View style={styles.searchIconContainer}>
          <Text style={styles.searchHeaderIcon}>🔍</Text>
        </View>
        <Text style={styles.searchTitle}>Find Whispers</Text>
      </View>

      <View style={[
        styles.searchInputContainer,
        searchFocused && styles.searchInputFocused
      ]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search thoughts, moods, or keywords..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => {
            setSearchFocused(true);
            Animated.timing(searchAnimation, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
          onBlur={() => {
            setSearchFocused(false);
            Animated.timing(searchAnimation, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => handleSearch('')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearSearchText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {location && (
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeIcon}>📍</Text>
          <Text style={styles.locationBadgeText}>
            Exploring from {location.city}
          </Text>
        </View>
      )}
    </Animated.View>
  ), [searchQuery, searchFocused, location, handleSearch, fadeAnimation, slideAnimation]);

  const CategoryButton = useCallback(({ category, isSelected, onPress, index = 0 }) => (
    <Animated.View
      style={{
        opacity: fadeAnimation,
        transform: [{ 
          translateY: slideAnimation.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 30 + (index * 5)],
            extrapolate: 'clamp',
          })
        }]
      }}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isSelected && [styles.selectedCategoryButton, { borderColor: category.color }]
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected ? [category.color + '20', category.color + '10'] : ['white', 'white']}
          style={styles.categoryButtonGradient}
        >
          <View style={[
            styles.categoryEmojiContainer,
            isSelected && { backgroundColor: category.color + '20' }
          ]}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          </View>
          <Text style={[
            styles.categoryText,
            isSelected && { color: category.color, fontWeight: '600' }
          ]}>
            {category.name}
          </Text>
          {isSelected && (
            <View style={[styles.categoryIndicator, { backgroundColor: category.color }]} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  ), [fadeAnimation, slideAnimation]);

  const CategoriesSection = useCallback(() => (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionIconContainer}>
          <Text style={styles.sectionIcon}>📂</Text>
        </View>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category, index) => (
          <CategoryButton
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() => handleCategoryChange(category.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  ), [categories, selectedCategory, handleCategoryChange]);

  const MoodStatsCard = useCallback(({ mood, index = 0 }) => (
    <Animated.View
      style={[
        styles.moodStatCard,
        {
          opacity: fadeAnimation,
          transform: [{ 
            translateY: slideAnimation.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 20 + (index * 3)],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}
    >
      <LinearGradient
        colors={[mood.color + '10', mood.color + '05']}
        style={styles.moodStatGradient}
      >
        <View style={[styles.moodStatEmojiContainer, { backgroundColor: mood.color + '20' }]}>
          <Text style={styles.moodStatEmoji}>{mood.emoji}</Text>
        </View>
        
        <Text style={styles.moodStatName}>{mood.name}</Text>
        <Text style={[styles.moodStatCount, { color: mood.color }]}>{mood.count}</Text>
        
        <View style={styles.moodStatBarContainer}>
          <View style={styles.moodStatBar}>
            <Animated.View
              style={[
                styles.moodStatProgress,
                { 
                  backgroundColor: mood.color,
                  width: `${Math.min(100, mood.percentage)}%`
                }
              ]}
            />
          </View>
          <Text style={[styles.moodStatPercentage, { color: mood.color }]}>
            {mood.percentage.toFixed(1)}%
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  ), [fadeAnimation, slideAnimation]);

  const MoodAnalyticsSection = useCallback(() => (
    <View style={styles.moodAnalyticsSection}>
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionIconContainer}>
          <Text style={styles.sectionIcon}>📊</Text>
        </View>
        <Text style={styles.sectionTitle}>Community Mood Trends</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodStatsContainer}
      >
        {getMoodStats.slice(0, 6).map((mood, index) => (
          <MoodStatsCard key={mood.id} mood={mood} index={index} />
        ))}
      </ScrollView>
    </View>
  ), [getMoodStats]);

  const WhispersHeader = useCallback(() => (
    <Animated.View 
      style={[
        styles.whispersHeader,
        {
          opacity: fadeAnimation,
          transform: [{ translateY: slideAnimation }]
        }
      ]}
    >
      <View style={styles.whispersHeaderContent}>
        <View style={styles.whispersHeaderLeft}>
          <View style={[
            styles.whispersHeaderIconContainer,
            { backgroundColor: categories.find(cat => cat.id === selectedCategory)?.color + '15' }
          ]}>
            <Text style={styles.whispersHeaderIcon}>
              {categories.find(cat => cat.id === selectedCategory)?.emoji}
            </Text>
          </View>
          <Text style={styles.whispersHeaderTitle}>
            {categories.find(cat => cat.id === selectedCategory)?.name} Whispers
          </Text>
        </View>
        
        <View style={styles.whispersCountBadge}>
          <Text style={styles.whispersCount}>{getFilteredWhispers.length}</Text>
        </View>
      </View>
    </Animated.View>
  ), [categories, selectedCategory, getFilteredWhispers.length, fadeAnimation, slideAnimation]);

  const renderWhisperItem = useCallback(({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnimation,
        transform: [{ 
          translateY: slideAnimation.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 10 + (index * 2)],
            extrapolate: 'clamp',
          })
        }]
      }}
    >
      <WhisperCard
        whisper={item}
        onLike={handleLikeWhisper}
        index={index}
      />
    </Animated.View>
  ), [handleLikeWhisper, fadeAnimation, slideAnimation]);

  const renderHeader = useCallback(() => (
    <>
      <SearchSection />
      <CategoriesSection />
      <MoodAnalyticsSection />
      <WhispersHeader />
    </>
  ), [SearchSection, CategoriesSection, MoodAnalyticsSection, WhispersHeader]);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading more whispers...</Text>
      </View>
    );
  }, [loading]);

  const renderEmptyComponent = useCallback(() => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnimation,
          transform: [{ translateY: slideAnimation }]
        }
      ]}
    >
      <LinearGradient
        colors={[COLORS.primaryLight + '10', COLORS.primary + '10']}
        style={styles.emptyStateGradient}
      >
        <View style={styles.emptyStateIconContainer}>
          <Text style={styles.emptyStateEmoji}>🔍</Text>
        </View>
        
        <Text style={styles.emptyStateTitle}>No whispers found</Text>
        <Text style={styles.emptyStateDescription}>
          {searchQuery.trim() 
            ? `No whispers match "${searchQuery}". Try different keywords or explore other categories.`
            : `No ${selectedCategory} whispers available right now. Check back later or try a different category.`
          }
        </Text>
        
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={() => {
            handleSearch('');
            handleCategoryChange('popular');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.primary]}
            style={styles.emptyActionGradient}
          >
            <Text style={styles.emptyActionText}>🔄 Reset Filters</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  ), [searchQuery, selectedCategory, handleSearch, handleCategoryChange, fadeAnimation, slideAnimation]);

  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header />

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
    height: HEADER_HEIGHT,
    paddingTop: 50,
    paddingBottom: SIZES.medium,
    paddingHorizontal: SIZES.large,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SIZES.base,
  },
  headerSubtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.large,
    paddingBottom: SIZES.xlarge * 2,
  },
  searchCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusXLarge,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    ...SHADOWS.large,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  searchHeaderIcon: {
    fontSize: 18,
  },
  searchTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchInputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLarge,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchInputFocused: {
    borderColor: COLORS.primary + '40',
    backgroundColor: 'white',
    ...SHADOWS.medium,
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
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.radiusLarge,
    alignSelf: 'flex-start',
    marginTop: SIZES.medium,
  },
  locationBadgeIcon: {
    fontSize: 14,
    marginRight: SIZES.small,
  },
  locationBadgeText: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoriesSection: {
    marginBottom: SIZES.large,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingRight: SIZES.large,
    gap: SIZES.small,
  },
  categoryButton: {
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    minWidth: 120,
  },
  selectedCategoryButton: {
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryButtonGradient: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
    position: 'relative',
  },
  categoryEmojiContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  moodAnalyticsSection: {
    marginBottom: SIZES.large,
  },
  moodStatsContainer: {
    paddingRight: SIZES.large,
    gap: SIZES.small,
  },
  moodStatCard: {
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    minWidth: 110,
    ...SHADOWS.medium,
  },
  moodStatGradient: {
    padding: SIZES.medium,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  moodStatEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  moodStatEmoji: {
    fontSize: 20,
  },
  moodStatName: {
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  moodStatCount: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  moodStatBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  moodStatBar: {
    width: 80,
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
    fontWeight: '600',
  },
  whispersHeader: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  whispersHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whispersHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  whispersHeaderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  whispersHeaderIcon: {
    fontSize: 18,
  },
  whispersHeaderTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  whispersCountBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.radiusLarge,
  },
  whispersCount: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: SIZES.xlarge,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.medium,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
    marginTop: SIZES.medium,
    ...SHADOWS.large,
  },
  emptyStateGradient: {
    padding: SIZES.xlarge * 1.5,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xlarge,
  },
  emptyStateEmoji: {
    fontSize: 48,
  },
  emptyStateTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xlarge,
    paddingHorizontal: SIZES.medium,
  },
  emptyActionButton: {
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyActionGradient: {
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.xlarge * 1.5,
    alignItems: 'center',
  },
  emptyActionText: {
    color: 'white',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
})
// ⬇️ Add this at the very bottom of ProfileScreen.js
export default ExploreScreen;
