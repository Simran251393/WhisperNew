// src/screens/AddWhisperScreen.js
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
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { validateWhisperText, containsBadWords } from '../utils/helpers';
import MoodSelector from '../components/MoodSelector';

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
  
  const textInputRef = useRef(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Character count and validation
  const characterInfo = useMemo(() => {
    const length = text.length;
    const remaining = MAX_CHAR_LIMIT - length;
    
    let color = COLORS.textMuted;
    if (length > DANGER_THRESHOLD) color = '#FF5252';
    else if (length > WARNING_THRESHOLD) color = '#FF9800';
    
    return {
      length,
      remaining,
      color,
      isNearLimit: length > WARNING_THRESHOLD,
      isOverLimit: length > MAX_CHAR_LIMIT
    };
  }, [text]);

  const isValidToPost = useMemo(() => {
    return text.trim().length > 0 && 
           text.length <= MAX_CHAR_LIMIT && 
           currentMood && 
           !isPosting;
  }, [text, currentMood, isPosting]);

  useEffect(() => {
    // Auto focus with slight delay for better UX
    const focusTimer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 300);

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
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
  }, [shakeAnimation]);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
    setValidationError('');
    
    // Real-time validation
    if (newText.length > MAX_CHAR_LIMIT) {
      shakeInput();
      setValidationError(`Text is too long. Please remove ${newText.length - MAX_CHAR_LIMIT} characters.`);
    }
  }, [shakeInput]);

  const handleClose = useCallback(() => {
    if (text.trim().length > 0) {
      Alert.alert(
        'Discard Whisper?',
        'Are you sure you want to discard this whisper?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [text, navigation]);

  const handlePost = useCallback(async () => {
    // Clear previous errors
    setValidationError('');

    // Comprehensive validation
    const validation = validateWhisperText(text);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      shakeInput();
      return;
    }

    // Check for inappropriate content
    if (containsBadWords(text)) {
      Alert.alert(
        'Content Warning',
        'Your whisper contains inappropriate content. Please revise it to follow our community guidelines.',
        [{ text: 'OK' }]
      );
      shakeInput();
      return;
    }

    // Check mood selection
    if (!currentMood) {
      setValidationError('Please select a mood for your whisper.');
      shakeInput();
      return;
    }

    setIsPosting(true);
    
    try {
      const success = await addWhisper(text.trim(), currentMood);
      
      if (success) {
        // Success feedback
        Alert.alert(
          'Success! 🎉',
          'Your whisper has been shared anonymously with the community.',
          [
            {
              text: 'Share Another',
              onPress: () => {
                setText('');
                setCurrentMood(selectedMood);
                textInputRef.current?.focus();
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
        'Error',
        'Something went wrong while posting your whisper. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPosting(false);
    }
  }, [text, currentMood, addWhisper, navigation, selectedMood, shakeInput]);

  const guidelines = useMemo(() => [
    'Be respectful and kind to others',
    'No hate speech or harassment',
    'Keep content appropriate for all ages',
    'Respect privacy and anonymity'
  ], []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.headerButtonText}>×</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Share Your Whisper</Text>
          
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.postHeaderButton,
              !isValidToPost && styles.disabledHeaderButton
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
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Location Info */}
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 Sharing in: {location?.city || 'Current Location'}
          </Text>
          <Text style={styles.anonymousText}>
            🔒 Posted anonymously
          </Text>
        </View>

        {/* Mood Selection */}
        {!keyboardVisible && (
          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>Select Mood</Text>
            <MoodSelector
              selectedMood={currentMood}
              onMoodSelect={setCurrentMood}
            />
          </View>
        )}

        {/* Text Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Your Whisper</Text>
          <Animated.View 
            style={[
              styles.inputContainer,
              validationError && styles.inputError,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="What's on your mind? Share your thoughts..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={MAX_CHAR_LIMIT + 50} // Allow slight overflow for better UX
              value={text}
              onChangeText={handleTextChange}
              textAlignVertical="top"
              autoCorrect
              autoCapitalize="sentences"
              scrollEnabled
            />
            
            {/* Character count */}
            <View style={styles.characterCountContainer}>
              <Text style={[
                styles.characterCount,
                { color: characterInfo.color }
              ]}>
                {characterInfo.remaining < 0 ? 
                  `${Math.abs(characterInfo.remaining)} over limit` :
                  `${characterInfo.remaining} remaining`
                }
              </Text>
              {characterInfo.isNearLimit && (
                <View style={[
                  styles.progressBar,
                  characterInfo.isOverLimit && styles.progressBarDanger
                ]}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${Math.min(100, (characterInfo.length / MAX_CHAR_LIMIT) * 100)}%`,
                        backgroundColor: characterInfo.color
                      }
                    ]} 
                  />
                </View>
              )}
            </View>
          </Animated.View>

          {/* Validation Error */}
          {validationError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}

          {/* Guidelines */}
          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Community Guidelines:</Text>
            {guidelines.map((guideline, index) => (
              <Text key={index} style={styles.guidelineItem}>• {guideline}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Action Button (visible when keyboard is open) */}
      {keyboardVisible && isValidToPost && (
        <View style={styles.keyboardActions}>
          <TouchableOpacity
            style={styles.keyboardPostButton}
            onPress={handlePost}
            disabled={isPosting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.primary]}
              style={styles.keyboardPostButtonGradient}
            >
              {isPosting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.keyboardPostButtonText}>
                  ✨ Post Whisper
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postHeaderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SIZES.medium,
    width: 'auto',
    minWidth: 60,
  },
  disabledHeaderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: SIZES.h4,
    fontWeight: '600',
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
    paddingHorizontal: SIZES.large,
    paddingTop: SIZES.large,
  },
  locationInfo: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
    ...SHADOWS.small,
  },
  locationText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    marginBottom: SIZES.base,
  },
  anonymousText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  moodSection: {
    marginBottom: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  inputSection: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: '#FF5252',
    borderWidth: 1,
  },
  textInput: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 120,
    maxHeight: 200,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: SIZES.small,
  },
  characterCount: {
    fontSize: SIZES.small,
    fontWeight: '500',
    marginBottom: SIZES.base,
  },
  progressBar: {
    width: 100,
    height: 3,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarDanger: {
    backgroundColor: '#FFEBEE',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: SIZES.radius,
    padding: SIZES.small,
    marginBottom: SIZES.medium,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5252',
  },
  errorText: {
    fontSize: SIZES.small,
    color: '#FF5252',
    fontWeight: '500',
  },
  guidelines: {
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  guidelinesTitle: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  guidelineItem: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
    lineHeight: 18,
  },
  keyboardActions: {
    backgroundColor: 'white',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  keyboardPostButton: {
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
  },
  keyboardPostButtonGradient: {
    paddingVertical: SIZES.medium,
    alignItems: 'center',
  },
  keyboardPostButtonText: {
    color: 'white',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default AddWhisperScreen;