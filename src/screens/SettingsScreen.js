// src/screens/SettingsScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  Alert,
  Haptic
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const SettingsScreen = ({ navigation }) => {
  const { locationRadius, setLocationRadius } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoLocation, setAutoLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  const radiusOptions = useMemo(() => [
    { value: 500, label: '500m', description: 'Very close' },
    { value: 1000, label: '1km', description: 'Walking distance' },
    { value: 2000, label: '2km', description: 'Neighborhood' },
    { value: 5000, label: '5km', description: 'City area' }
  ], []);

  const settingSections = useMemo(() => [
    {
      id: 'location',
      title: 'Location',
      items: [
        {
          id: 'auto-location',
          type: 'switch',
          title: 'Auto-detect Location',
          subtitle: 'Automatically use your current location',
          value: autoLocation,
          onValueChange: setAutoLocation,
        },
        {
          id: 'radius',
          type: 'custom',
          title: 'Search Radius',
          subtitle: 'Choose how far to search for whispers around you',
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      items: [
        {
          id: 'push-notifications',
          type: 'switch',
          title: 'Push Notifications',
          subtitle: 'Get notified about nearby whispers',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          id: 'notification-radius',
          type: 'text',
          title: 'Notification Radius',
          subtitle: 'Same as search radius',
          disabled: !notifications,
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      items: [
        {
          id: 'dark-mode',
          type: 'switch',
          title: 'Dark Mode',
          subtitle: 'Coming soon',
          value: darkMode,
          onValueChange: setDarkMode,
          disabled: true,
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      items: [
        {
          id: 'content-filtering',
          type: 'switch',
          title: 'Content Filtering',
          subtitle: 'Automatically filter inappropriate content',
          value: true,
          disabled: true,
        },
        {
          id: 'anonymous-mode',
          type: 'badge',
          title: 'Anonymous Mode',
          subtitle: 'Always enabled for your privacy',
          badge: 'Enabled',
          disabled: true,
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      items: [
        {
          id: 'export-data',
          type: 'action',
          title: 'Export My Data',
          subtitle: 'Download all your whispers',
          onPress: handleExportData,
        },
        {
          id: 'clear-data',
          type: 'danger',
          title: 'Clear All Data',
          subtitle: 'Delete all whispers and reset app',
          onPress: handleClearData,
        }
      ]
    }
  ], [notifications, autoLocation, darkMode]);

  const handleRadiusChange = useCallback(async (value) => {
    try {
      await setLocationRadius(value);
      // Add haptic feedback if available
      if (Haptic && Haptic.impactAsync) {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update radius setting.');
    }
  }, [setLocationRadius]);

  function handleExportData() {
    Alert.alert(
      'Export Data',
      'This feature will be available soon. You will be able to download all your whispers as a JSON file.',
      [{ text: 'OK' }]
    );
  }

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will delete all your whispers and reset the app. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Simulate clearing data
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  const SettingItem = useCallback(({ item }) => {
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
                true: COLORS.primaryLight 
              }}
              thumbColor={item.value ? COLORS.primary : COLORS.gray}
            />
          );
        case 'badge':
          return (
            <Text style={styles.enabledBadge}>{item.badge}</Text>
          );
        case 'action':
          return (
            <Text style={styles.chevron}>›</Text>
          );
        default:
          return null;
      }
    };

    if (item.type === 'danger') {
      return (
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={item.onPress}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.dangerButtonText}>{item.title}</Text>
          <Text style={styles.dangerButtonSubtext}>{item.subtitle}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.settingItem, 
          item.disabled && styles.disabledSettingItem
        ]}
        onPress={item.onPress}
        disabled={item.disabled || !item.onPress}
        activeOpacity={item.onPress ? 0.7 : 1}
      >
        <View style={styles.settingItemLeft}>
          <Text style={[
            styles.settingItemTitle, 
            item.disabled && styles.disabledText
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[
              styles.settingItemSubtitle, 
              item.disabled && styles.disabledText
            ]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        {renderRightComponent()}
      </TouchableOpacity>
    );
  }, [loading]);

  const RadioOption = useCallback(({ option, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.radioOption, selected && styles.selectedRadioOption]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.radioOptionContent}>
        <View style={[
          styles.radioButton,
          selected && { borderColor: 'white' }
        ]}>
          {selected && <View style={styles.radioButtonSelected} />}
        </View>
        <View style={styles.radioOptionText}>
          <Text style={[styles.radioOptionLabel, selected && styles.selectedRadioLabel]}>
            {option.label}
          </Text>
          {option.description && (
            <Text style={[styles.radioOptionDescription, selected && styles.selectedRadioDescription]}>
              {option.description}
            </Text>
          )}
        </View>
      </View>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  ), []);

  const renderRadiusSection = useCallback(() => (
    <View style={styles.radiusSection}>
      <Text style={styles.radiusTitle}>Search Radius</Text>
      <Text style={styles.radiusSubtitle}>
        Choose how far to search for whispers around you
      </Text>
      
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
  ), [locationRadius, radiusOptions, handleRadiusChange]);

  const renderSectionHeader = useCallback(({ section }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  ), []);

  const renderSectionItem = useCallback(({ item, section }) => {
    if (item.id === 'radius' && section.id === 'location') {
      return renderRadiusSection();
    }
    return <SettingItem item={item} />;
  }, [SettingItem, renderRadiusSection]);

  const sections = settingSections.map(section => ({
    ...section,
    data: section.items
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <FlatList
        data={sections}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            {renderSectionHeader({ section })}
            {section.data.map((item, index) => (
              <View key={item.id}>
                {renderSectionItem({ item, section })}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(section) => section.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListFooterComponent={() => (
          <View style={styles.appInfo}>
            <Text style={styles.appInfoTitle}>Whisper Walls</Text>
            <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
            <Text style={styles.appInfoDescription}>
              Share your thoughts anonymously with people around you
            </Text>
          </View>
        )}
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
    paddingBottom: SIZES.medium,
    paddingHorizontal: SIZES.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: SIZES.h3,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: SIZES.large,
  },
  section: {
    marginTop: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  disabledSettingItem: {
    backgroundColor: '#f8f8f8',
  },
  settingItemLeft: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  radiusSection: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  radiusTitle: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  radiusSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginBottom: SIZES.medium,
  },
  radiusOptions: {
    gap: SIZES.small,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
  },
  selectedRadioOption: {
    backgroundColor: COLORS.primary,
  },
  radioOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray,
    marginRight: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  radioOptionText: {
    flex: 1,
  },
  radioOptionLabel: {
    fontSize: SIZES.caption,
    fontWeight: '500',
    color: COLORS.text,
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
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enabledBadge: {
    backgroundColor: COLORS.primary,
    color: 'white',
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  dangerButton: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginTop: SIZES.small,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5252',
    ...SHADOWS.small,
  },
  dangerButtonText: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: '#FF5252',
    marginBottom: 2,
  },
  dangerButtonSubtext: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SIZES.xlarge,
    marginTop: SIZES.large,
  },
  appInfoTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  appInfoVersion: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginBottom: SIZES.small,
  },
  appInfoDescription: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;