// src/screens/SettingsScreen.js - Optimized Version
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 120;

const SettingsScreen = ({ navigation }) => {
  const { locationRadius, setLocationRadius } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoLocation, setAutoLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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

  const radiusOptions = useMemo(() => [
    { value: 500, label: '500m', description: 'Very close', emoji: '🏠' },
    { value: 1000, label: '1km', description: 'Walking distance', emoji: '🚶' },
    { value: 2000, label: '2km', description: 'Neighborhood', emoji: '🏘️' },
    { value: 5000, label: '5km', description: 'City area', emoji: '🏙️' }
  ], []);

  const settingSections = useMemo(() => [
    {
      id: 'location',
      title: 'Location & Privacy',
      emoji: '📍',
      items: [
        {
          id: 'auto-location',
          type: 'switch',
          title: 'Auto-detect Location',
          subtitle: 'Automatically use your current location',
          emoji: '🎯',
          value: autoLocation,
          onValueChange: setAutoLocation,
        },
        {
          id: 'radius',
          type: 'custom',
          title: 'Search Radius',
          subtitle: 'Choose how far to search for whispers',
          emoji: '📏',
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      emoji: '🔔',
      items: [
        {
          id: 'push-notifications',
          type: 'switch',
          title: 'Push Notifications',
          subtitle: 'Get notified about nearby whispers',
          emoji: '📱',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          id: 'notification-sounds',
          type: 'switch',
          title: 'Notification Sounds',
          subtitle: 'Play sound with notifications',
          emoji: '🔊',
          value: true,
          onValueChange: () => {},
          disabled: !notifications,
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      emoji: '🎨',
      items: [
        {
          id: 'dark-mode',
          type: 'switch',
          title: 'Dark Mode',
          subtitle: 'Coming soon in future updates',
          emoji: '🌙',
          value: darkMode,
          onValueChange: setDarkMode,
          disabled: true,
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      emoji: '🔒',
      items: [
        {
          id: 'content-filtering',
          type: 'badge',
          title: 'Content Filtering',
          subtitle: 'Automatically filter inappropriate content',
          emoji: '🛡️',
          badge: 'Always On',
          color: '#4CAF50',
        },
        {
          id: 'anonymous-mode',
          type: 'badge',
          title: 'Anonymous Mode',
          subtitle: 'Your identity is always protected',
          emoji: '👤',
          badge: 'Protected',
          color: COLORS.primary,
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      emoji: '💾',
      items: [
        {
          id: 'export-data',
          type: 'action',
          title: 'Export My Data',
          subtitle: 'Download all your whispers',
          emoji: '📁',
          onPress: handleExportData,
          color: '#2196F3',
        },
        {
          id: 'clear-data',
          type: 'danger',
          title: 'Clear All Data',
          subtitle: 'Delete all whispers and reset app',
          emoji: '🗑️',
          onPress: handleClearData,
          color: '#FF5252',
        }
      ]
    }
  ], [notifications, autoLocation, darkMode]);

  const handleRadiusChange = useCallback(async (value) => {
    try {
      await setLocationRadius(value);
      // Add haptic feedback if available
      if (Platform.OS === 'ios') {
        import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
          impactAsync(ImpactFeedbackStyle.Light);
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update radius setting.');
    }
  }, [setLocationRadius]);

  function handleExportData() {
    Alert.alert(
      '📁 Export Data',
      'This feature will be available soon. You will be able to download all your whispers as a secure JSON file.',
      [
        { text: 'Notify Me', onPress: () => {} },
        { text: 'OK' }
      ]
    );
  }

  function handleClearData() {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will permanently delete all your whispers and reset the app. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('✅ Success', 'All data has been cleared successfully.');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear data. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  const SettingItem = useCallback(({ item, index = 0 }) => {
    const renderRightComponent = () => {
      switch (item.type) {
        case 'switch':
          return (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              disabled={item.disabled}
              trackColor={{ 
                false: COLORS.lightGray, 
                true: COLORS.primaryLight + '80'
              }}
              thumbColor={item.value ? COLORS.primary : COLORS.gray}
            />
          );
        case 'badge':
          return (
            <View style={[styles.statusBadge, { backgroundColor: (item.color || COLORS.primary) + '15' }]}>
              <Text style={[styles.statusBadgeText, { color: item.color || COLORS.primary }]}>
                {item.badge}
              </Text>
            </View>
          );
        case 'action':
          return (
            <View style={[styles.actionButton, { backgroundColor: (item.color || COLORS.primary) + '15' }]}>
              <Text style={[styles.actionIcon, { color: item.color || COLORS.primary }]}>
                ›
              </Text>
            </View>
          );
        default:
          return null;
      }
    };

    if (item.type === 'danger') {
      return (
        <Animated.View 
          style={[
            styles.settingCard,
            styles.dangerCard,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideAnimation }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.settingItemContent}
            onPress={item.onPress}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingItemIcon, { backgroundColor: '#FF5252' + '15' }]}>
                <Text style={styles.settingItemEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: '#FF5252' }]}>
                  {item.title}
                </Text>
                <Text style={styles.settingItemSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            <View style={[styles.actionButton, { backgroundColor: '#FF5252' + '15' }]}>
              <Text style={[styles.actionIcon, { color: '#FF5252' }]}>›</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View 
        style={[
          styles.settingCard,
          item.disabled && styles.disabledCard,
          {
            opacity: fadeAnimation,
            transform: [{ 
              translateY: slideAnimation.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 + (index * 10)],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.settingItemContent}
          onPress={item.onPress}
          disabled={item.disabled || !item.onPress}
          activeOpacity={item.onPress ? 0.7 : 1}
        >
          <View style={styles.settingItemLeft}>
            <View style={[
              styles.settingItemIcon,
              { backgroundColor: (item.color || COLORS.primary) + '15' }
            ]}>
              <Text style={styles.settingItemEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.settingItemText}>
              <Text style={[
                styles.settingItemTitle,
                item.disabled && styles.disabledText
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.settingItemSubtitle,
                item.disabled && styles.disabledText
              ]}>
                {item.subtitle}
              </Text>
            </View>
          </View>
          {renderRightComponent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }, [loading, fadeAnimation, slideAnimation]);

  const RadioOption = useCallback(({ option, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.radioOption, selected && styles.selectedRadioOption]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={selected ? [COLORS.primaryLight, COLORS.primary] : ['transparent', 'transparent']}
        style={styles.radioOptionGradient}
      >
        <View style={styles.radioOptionContent}>
          <View style={styles.radioOptionLeft}>
            <Text style={styles.radioOptionEmoji}>{option.emoji}</Text>
            <View style={styles.radioOptionTextContainer}>
              <Text style={[
                styles.radioOptionLabel,
                selected && styles.selectedRadioLabel
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.radioOptionDescription,
                selected && styles.selectedRadioDescription
              ]}>
                {option.description}
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioIndicator,
            selected && styles.selectedRadioIndicator
          ]}>
            {selected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const renderRadiusSection = useCallback(() => (
    <Animated.View 
      style={[
        styles.settingCard,
        {
          opacity: fadeAnimation,
          transform: [{ translateY: slideAnimation }]
        }
      ]}
    >
      <View style={styles.radiusSection}>
        <View style={styles.radiusSectionHeader}>
          <View style={[styles.settingItemIcon, { backgroundColor: COLORS.primary + '15' }]}>
            <Text style={styles.settingItemEmoji}>📏</Text>
          </View>
          <View style={styles.settingItemText}>
            <Text style={styles.settingItemTitle}>Search Radius</Text>
            <Text style={styles.settingItemSubtitle}>
              Choose how far to search for whispers
            </Text>
          </View>
        </View>
        
        <View style={styles.radiusOptions}>
          {radiusOptions.map(option => (
            <RadioOption
              key={option.value}
              option={option}
              selected={locationRadius === option.value}
              onPress={() => handleRadiusChange(option.value)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  ), [locationRadius, radiusOptions, handleRadiusChange, fadeAnimation, slideAnimation]);

  const SectionHeader = useCallback(({ section, index = 0 }) => (
    <Animated.View 
      style={[
        styles.sectionHeader,
        {
          opacity: fadeAnimation,
          transform: [{ 
            translateY: slideAnimation.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 20 + (index * 5)],
              extrapolate: 'clamp',
            })
          }]
        }
      ]}
    >
      <View style={styles.sectionHeaderContent}>
        <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
          <Text style={styles.sectionHeaderEmoji}>{section.emoji}</Text>
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={styles.sectionHeaderLine} />
    </Animated.View>
  ), [fadeAnimation, slideAnimation]);

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </Animated.View>
    </View>
  ), [navigation, fadeAnimation, slideAnimation]);

  const AppInfo = useCallback(() => (
    <Animated.View 
      style={[
        styles.appInfoCard,
        {
          opacity: fadeAnimation,
          transform: [{ translateY: slideAnimation }]
        }
      ]}
    >
      <LinearGradient
        colors={[COLORS.primaryLight + '10', COLORS.primary + '10']}
        style={styles.appInfoGradient}
      >
        <View style={styles.appInfoHeader}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>💬</Text>
          </View>
          <View style={styles.appInfoTextContainer}>
            <Text style={styles.appInfoTitle}>Whisper Walls</Text>
            <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          </View>
        </View>
        
        <Text style={styles.appInfoDescription}>
          Share your thoughts anonymously with people around you. 
          Connect with your community while maintaining complete privacy.
        </Text>
        
        <View style={styles.appInfoFeatures}>
          <View style={styles.appInfoFeature}>
            <Text style={styles.featureEmoji}>🔒</Text>
            <Text style={styles.featureText}>100% Anonymous</Text>
          </View>
          <View style={styles.appInfoFeature}>
            <Text style={styles.featureEmoji}>🌍</Text>
            <Text style={styles.featureText}>Location-based</Text>
          </View>
          <View style={styles.appInfoFeature}>
            <Text style={styles.featureEmoji}>💙</Text>
            <Text style={styles.featureText}>Community-driven</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  ), [fadeAnimation, slideAnimation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {settingSections.map((section, sectionIndex) => (
          <View key={section.id}>
            <SectionHeader section={section} index={sectionIndex} />
            
            {section.items.map((item, itemIndex) => {
              if (item.id === 'radius' && section.id === 'location') {
                return renderRadiusSection();
              }
              return (
                <SettingItem 
                  key={item.id} 
                  item={item} 
                  index={sectionIndex * 2 + itemIndex}
                />
              );
            })}
          </View>
        ))}

        <AppInfo />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 28,
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
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.large,
    paddingBottom: SIZES.xlarge * 2,
  },
  sectionHeader: {
    marginTop: SIZES.xlarge,
    marginBottom: SIZES.medium,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  sectionHeaderEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionHeaderLine: {
    height: 3,
    backgroundColor: COLORS.primary + '30',
    borderRadius: 1.5,
    width: 60,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.medium,
    ...SHADOWS.medium,
  },
  disabledCard: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7,
  },
  dangerCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  settingItemContent: {
    padding: SIZES.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.large,
  },
  settingItemEmoji: {
    fontSize: 20,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  settingItemSubtitle: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  disabledText: {
    color: COLORS.textMuted,
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  radiusSection: {
    padding: SIZES.large,
  },
  radiusSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  radiusOptions: {
    gap: SIZES.small,
  },
  radioOption: {
    borderRadius: SIZES.radiusMedium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedRadioOption: {
    borderColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  radioOptionGradient: {
    padding: SIZES.medium,
  },
  radioOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOptionEmoji: {
    fontSize: 18,
    marginRight: SIZES.medium,
  },
  radioOptionTextContainer: {
    flex: 1,
  },
  radioOptionLabel: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  selectedRadioLabel: {
    color: 'white',
  },
  radioOptionDescription: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  selectedRadioDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  radioIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioIndicator: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  appInfoCard: {
    marginTop: SIZES.xlarge,
    borderRadius: SIZES.radiusXLarge,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  appInfoGradient: {
    padding: SIZES.xlarge,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  appIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.large,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appIcon: {
    fontSize: 28,
  },
  appInfoTextContainer: {
    flex: 1,
  },
  appInfoTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  appInfoVersion: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  appInfoDescription: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  appInfoFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  appInfoFeature: {
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 20,
    marginBottom: SIZES.small,
  },
  featureText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default SettingsScreen;
