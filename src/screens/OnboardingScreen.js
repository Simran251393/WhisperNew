// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setIsFirstLaunch, requestLocationPermission } = useApp();
  const scrollViewRef = useRef(null);

  const slides = [
    {
      id: 1,
      emoji: '🏮',
      title: 'Welcome to\nWhisper Walls',
      description: 'Share your thoughts anonymously with people around you. No accounts, no judgments.',
      buttonText: 'Continue'
    },
    {
      id: 2,
      emoji: '📍',
      title: 'Location Based\nSharing',
      description: 'Discover whispers from people in your area. Your exact location is never shared.',
      buttonText: 'Continue'
    },
    {
      id: 3,
      emoji: '😌',
      title: 'Express Your\nMoods',
      description: 'Share different types of thoughts: Calm, Love, Dear, or Greed. Find your vibe.',
      buttonText: 'Continue'
    },
    {
      id: 4,
      emoji: '🔒',
      title: 'Completely\nAnonymous',
      description: 'No profiles, no followers, no data collection. Just pure, honest expression.',
      buttonText: 'Get Started'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    // Request location permission
    await requestLocationPermission();
    
    // Mark onboarding as complete
    setIsFirstLaunch(false);
  };

  const skipOnboarding = () => {
    setIsFirstLaunch(false);
  };

  const onScrollEnd = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundLight]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.slideContainer}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.slideContent}>
              <View style={styles.emojiContainer}>
                <Text style={styles.slideEmoji}>{slide.emoji}</Text>
              </View>
              
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlide === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={nextSlide}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.primary]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {slides[currentSlide]?.buttonText}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xlarge,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xlarge,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  slideEmoji: {
    fontSize: 50,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.large,
    lineHeight: 36,
  },
  slideDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xlarge,
  },
  bottomSection: {
    paddingHorizontal: SIZES.xlarge,
    paddingBottom: 40,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.xlarge,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  continueButton: {
    width: '100%',
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;