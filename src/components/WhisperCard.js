// src/components/WhisperCard.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatTimestamp, formatDistance } from '../utils/helpers';

const WhisperCard = ({ whisper, onLike, style }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = () => {
    onLike && onLike(whisper.id);
    handlePress();
  };

  // Calculate progress bar width based on likes
  const progressWidth = Math.min(100, whisper.likes * 5);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Mood indicator line */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.moodIndicator}
      />

      {/* Whisper content */}
      <View style={styles.content}>
        <Text style={styles.whisperText}>{whisper.text}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressWidth}%` },
            ]}
          />
        </View>

        {/* Meta information */}
        <View style={styles.metaContainer}>
          <View style={styles.leftMeta}>
            <Text style={styles.timeText}>
              {formatTimestamp(whisper.timestamp)}
            </Text>
            {whisper.distance && (
              <Text style={styles.distanceText}>
                • {formatDistance(whisper.distance)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Text style={styles.likeText}>💙 {whisper.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    overflow: 'hidden',
    marginBottom: SIZES.medium,
    ...SHADOWS.medium,
  },
  moodIndicator: {
    height: 3,
  },
  content: {
    padding: SIZES.large,
  },
  whisperText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SIZES.medium,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f0dada',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.small,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  distanceText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginLeft: SIZES.base,
  },
  likeButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
  },
  likeText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default WhisperCard;