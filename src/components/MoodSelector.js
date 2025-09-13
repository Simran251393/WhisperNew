// src/components/MoodSelector.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, MOODS } from '../constants/theme';

const MoodSelector = ({ selectedMood, onMoodSelect, style, layout = 'grid' }) => {
  const scaleAnims = MOODS.reduce((acc, mood) => {
    acc[mood.id] = new Animated.Value(1);
    return acc;
  }, {});

  const handleMoodPress = (moodId) => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnims[moodId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[moodId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onMoodSelect && onMoodSelect(moodId);
  };

  const renderMoodButton = (mood) => {
    const isSelected = selectedMood === mood.id;
    
    return (
      <Animated.View
        key={mood.id}
        style={[
          styles.moodButtonContainer,
          layout === 'horizontal' && styles.horizontalButton,
          {
            transform: [{ scale: scaleAnims[mood.id] }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleMoodPress(mood.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={mood.colors}
            style={[
              styles.moodButton,
              isSelected && styles.selectedMoodButton,
              layout === 'horizontal' && styles.horizontalMoodButton,
            ]}
          >
            <Text
              style={[
                styles.moodButtonText,
                { color: mood.textColor },
                isSelected && styles.selectedMoodText,
              ]}
            >
              {mood.emoji} {mood.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.moodGrid,
          layout === 'horizontal' && styles.horizontalContainer,
        ]}
      >
        {MOODS.map(renderMoodButton)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  horizontalContainer: {
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
  },
  moodButtonContainer: {
    width: '48%',
    marginBottom: SIZES.small,
  },
  horizontalButton: {
    width: 'auto',
    flex: 1,
    marginHorizontal: SIZES.base / 2,
    marginBottom: 0,
  },
  moodButton: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  horizontalMoodButton: {
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.radiusMedium,
  },
  selectedMoodButton: {
    borderColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moodButtonText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedMoodText: {
    fontWeight: '700',
  },
});

export default MoodSelector;