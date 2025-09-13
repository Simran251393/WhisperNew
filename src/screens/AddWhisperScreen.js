// src/screens/AddWhisperScreen.js - Optimized Version
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { validateWhisperText, containsBadWords } from '../utils/helpers';
import MoodSelector from '../components/MoodSelector';

const { width, height } = Dimensions.get('window');
const MAX_CHAR_LIMIT = 400;
const WARNING_THRESHOLD = 350;
const DANGER_THRESHOLD = 380;

const AddWhisperScreen = ({ navigation }) => {
  const { selectedMood, addWhisper, location } = useApp();
  const [text, setText] = useState('');
  const [currentMood, setCurrentMood] = useState(selectedMood);
  const [isPosting, setIsPosting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [focusedInput, setFocusedInput] = useState(false);
  
  const textInputRef = useRef(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  // Enhanced character analysis
  const characterInfo = useMemo(() => {
    const length = text.length;
    const remaining = MAX_CHAR_LIMIT - length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    let color = COLORS.textMuted;
    let status = 'normal';
    
    if (length > DANGER_THRESHOLD) {
      color = '#FF5252';
      status = 'danger';
    } else if (length > WARNING_THRESHOLD) {
      color = '#FF9800';
      status = 'warning';
    } else if (length > 100) {
      color = '#4CAF50';
      status = 'good';
    }
    
    return {
      length,
      remaining,
      words,
      color,
      status,
      isNearLimit: length > WARNING_THRESHOLD,
      isOverLimit: length > MAX_CHAR_LIMIT,
      progressPercentage: Math.min(100, (length / MAX_CHAR_LIMIT) * 100)
    };
  }, [text]);

  const isValidToPost = useMemo(() => {
    return text.trim().length >= 10 && 
           text.length <= MAX_CHAR_LIMIT && 
           currentMood && 
           !isPosting;
  }, [text, currentMood, isPosting]);

  useEffect(() => {
    // Animated entrance
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Auto focus with delay
    const focusTimer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 400);

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      Animated.timing(slideAnimation, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      clearTimeout(focusTimer);
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const shakeInput = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();

    // Haptic feedback
    if (Platform.OS === 'ios') {
      import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
        impactAsync(ImpactFeedbackStyle.Medium);
      });
    }
  }, [shakeAnimation]);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
    setValidationError('');
    
    // Real-time validation with visual feedback
    if (newText.length > MAX_CHAR_LIMIT) {
      shakeInput();
      setValidationError(`Text is ${newText.length - MAX_CHAR_LIMIT} characters too long.`);
    } else if (newText.length < 10 && newText.trim().length > 0) {
      setValidationError('Whispers should be at least 10 characters long.');
    }
  }, [shakeInput]);

  const handleClose = useCallback(() => {
    if (text.trim().length > 0) {
      Alert.alert(
        'Discard Whisper?',
        'Your whisper will be lost. Are you sure you want to go back?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              Animated.timing(fadeAnimation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start(() => navigation.goBack());
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [text, navigation, fadeAnimation]);

  const handlePost = useCallback(async () => {
    setValidationError('');

    // Comprehensive validation
    const validation = validateWhisperText(text);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      shakeInput();
      return;
    }

    // Content moderation
    if (containsBadWords(text)) {
      Alert.alert(
        'Content Guidelines',
        'Your whisper contains content that goes against our community guidelines. Please revise it to create a positive space for everyone.',
        [{ text: 'Edit Whisper' }]
      );
      shakeInput();
      return;
    }

    if (!currentMood) {
      setValidationError('Please select a mood that represents your whisper.');
      shakeInput();
      return;
    }

    setIsPosting(true);
    
    // Success haptic feedback
    if (Platform.OS === 'ios') {
      import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
        impactAsync(ImpactFeedbackStyle.Light);
      });
    }
    
    try {
      const success = await addWhisper(text.trim(), currentMood);
      
      if (success) {
        // Success animation
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimation, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();

        Alert.alert(
          'Whisper Shared! ✨',
          'Your anonymous whisper is now part of the community conversation.',
          [
            {
              text: 'Share Another',
              onPress: () => {
                setText('');
                setCurrentMood(selectedMood);
                setIsPosting(false);
                // Reset animations
                fadeAnimation.setValue(1);
                slideAnimation.setValue(1);
                setTimeout(() => textInputRef.current?.focus(), 100);
              },
            },
            {
              text: 'Done',
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to post whisper');
      }
    } catch (error) {
      console.error('Post whisper error:', error);
      Alert.alert(
        'Something Went Wrong',
        'We couldn\'t share your whisper right now. Please check your connection and try again.',
        [{ text: 'Retry', onPress: () => setIsPosting(false) }]
      );
      setIsPosting(false);
    }
  }, [text, currentMood, addWhisper, navigation, selectedMood, shakeInput, fadeAnimation, slideAnimation]);

  const guidelines = useMemo(() => [
    { icon: '🤝', text: 'Be kind and respectful to everyone' },
    { icon: '🚫', text: 'No hate speech or harassment' },
    { icon: '👨‍👩‍👧‍👦', text: 'Keep content appropriate for all ages' },
    { icon: '🔒', text: 'Respect privacy and anonymity' }
  ], []);

  // Enhanced header component
  const Header = useCallback(() => (
    <Animated.View style={[styles.header, { opacity: fadeAnimation }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.headerButtonText}>×</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>New Whisper</Text>
          <Text style={styles.headerSubtitle}>Share anonymously</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.postButton,
            !isValidToPost && styles.disabledPostButton
          ]}
          onPress={handlePost}
          disabled={!isValidToPost}
          activeOpacity={0.8}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[
              styles.postButtonText,
              !isValidToPost && styles.disabledPostButtonText
            ]}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  ), [fadeAnimation, handleClose, isValidToPost, handlePost, isPosting]);

  // Location info component
  const LocationInfo = useCallback(() => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationIconContainer}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationTitle}>Sharing from</Text>
          <Text style={styles.locationText}>
            {location?.city || 'Your current location'}
          </Text>
        </View>
      </View>
      <View style={styles.anonymityBadge}>
        <Text style={styles.anonymityIcon}>🔒</Text>
        <Text style={styles.anonymityText}>Posted anonymously</Text>
      </View>
    </View>
  ), [location]);

  // Writing tips component
  const WritingTips = useCallback(() => (
    <View style={styles.tipsCard}>
      <Text style={styles.tipsTitle}>💡 Writing Tips</Text>
      <Text style={styles.tipsText}>
        Share what's on your mind - a thought, feeling, question, or observation. 
        Your whisper could spark meaningful conversations!
      </Text>
    </View>
  ), []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnimation,
            transform: [{ scale: slideAnimation }]
          }
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <LocationInfo />

          {/* Mood Selection */}
          {!keyboardVisible && (
            <View style={styles.moodSection}>
              <Text style={styles.sectionTitle}>Select Your Mood</Text>
              <MoodSelector
                selectedMood={currentMood}
                onMoodSelect={setCurrentMood}
              />
            </View>
          )}

          {/* Text Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Your Whisper</Text>
            <Animated.View 
              style={[
                styles.inputContainer,
                validationError && styles.inputError,
                focusedInput && styles.inputFocused,
                { transform: [{ translateX: shakeAnimation }] }
              ]}
            >
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="What's on your mind? Share your thoughts, feelings, or questions..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={MAX_CHAR_LIMIT + 50}
                value={text}
                onChangeText={handleTextChange}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                textAlignVertical="top"
                autoCorrect
                autoCapitalize="sentences"
                scrollEnabled
                returnKeyType="default"
              />
              
              {/* Enhanced character counter */}
              <View style={styles.inputFooter}>
                <View style={styles.characterInfo}>
                  <Text style={[styles.wordCount, { color: characterInfo.color }]}>
                    {characterInfo.words} words
                  </Text>
                  <Text style={[styles.characterCount, { color: characterInfo.color }]}>
                    {characterInfo.remaining < 0 ? 
                      `${Math.abs(characterInfo.remaining)} over` :
                      `${characterInfo.remaining} left`
                    }
                  </Text>
                </View>
                
                {text.length > 50 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${Math.min(100, characterInfo.progressPercentage)}%`,
                            backgroundColor: characterInfo.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.progressPercentage, { color: characterInfo.color }]}>
                      {Math.round(characterInfo.progressPercentage)}%
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Validation Error */}
            {validationError ? (
              <Animated.View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{validationError}</Text>
              </Animated.View>
            ) : null}
          </View>

          {/* Writing Tips */}
          {!keyboardVisible && <WritingTips />}

          {/* Community Guidelines */}
          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <View style={styles.guidelinesList}>
              {guidelines.map((guideline, index) => (
                <View key={index} style={styles.guidelineItem}>
                  <Text style={styles.guidelineIcon}>{guideline.icon}</Text>
                  <Text style={styles.guidelineText}>{guideline.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Floating Post Button for keyboard mode */}
      {keyboardVisible && isValidToPost && (
        <Animated.View 
          style={[
            styles.floatingPostContainer,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation.interpolate({
                inputRange: [0.95, 1],
                outputRange: [0, 100]
              })}]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.floatingPostButton}
            onPress={handlePost}
            disabled={isPosting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.primary]}
              style={styles.floatingPostGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isPosting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.floatingPostIcon}>✨</Text>
                  <Text style={styles.floatingPostText}>Post Whisper</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
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
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radiusLarge,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledPostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postButtonText: {
    color: 'white',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  disabledPostButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.large,
    paddingBottom: 150,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  locationIcon: {
    fontSize: 18,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  anonymityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.radiusLarge,
    alignSelf: 'flex-start',
  },
  anonymityIcon: {
    fontSize: 14,
    marginRight: SIZES.small,
  },
  anonymityText: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  moodSection: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.large,
  },
  inputSection: {
    marginBottom: SIZES.large,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.medium,
  },
  inputError: {
    borderColor: '#FF5252',
    backgroundColor: '#FFEBEE',
  },
  inputFocused: {
    borderColor: COLORS.primary + '40',
    ...SHADOWS.large,
  },
  textInput: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  inputFooter: {
    marginTop: SIZES.medium,
    paddingTop: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  characterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  wordCount: {
    fontSize: SIZES.caption,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: SIZES.caption,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: SIZES.small,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: SIZES.small,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.medium,
    marginTop: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  errorIcon: {
    fontSize: 16,
    marginRight: SIZES.small,
  },
  errorText: {
    fontSize: SIZES.caption,
    color: '#FF5252',
    fontWeight: '500',
    flex: 1,
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    ...SHADOWS.small,
  },
  tipsTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: SIZES.medium,
  },
  tipsText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  guidelines: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.large,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
    ...SHADOWS.small,
  },
  guidelinesTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  guidelinesList: {
    gap: SIZES.medium,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidelineIcon: {
    fontSize: 16,
    marginRight: SIZES.medium,
    width: 24,
    textAlign: 'center',
  },
  guidelineText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    lineHeight: 20,
    flex: 1,
  },
  floatingPostContainer: {
    position: 'absolute',
    bottom: 20,
    left: SIZES.large,
    right: SIZES.large,
  },
  floatingPostButton: {
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  floatingPostGradient: {
    paddingVertical: SIZES.large,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  floatingPostIcon: {
    fontSize: 18,
    marginRight: SIZES.small,
  },
  floatingPostText: {
    color: 'white',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});
// ⬇️ Add this at the very bottom of ProfileScreen.js
export default AddWhisperScreen;
