// src/screens/AboutScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const AboutScreen = ({ navigation }) => {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const sections = [
    {
      title: 'Our Mission',
      emoji: '🎯',
      content: 'Whisper Walls provides a safe, anonymous space for people to share their thoughts, feelings, and experiences with others nearby. We believe in the power of human connection through authentic, judgment-free expression.'
    },
    {
      title: 'How It Works',
      emoji: '⚙️',
      content: 'Share your thoughts anonymously based on your location and mood. Others in your area can read and interact with your whispers, creating a unique community experience that celebrates local voices and emotions.'
    },
    {
      title: 'Privacy First',
      emoji: '🔒',
      content: 'Your privacy is our top priority. We don\'t collect personal information, track your identity, or store your exact location. All whispers are completely anonymous and your data stays secure.'
    },
    {
      title: 'Community Guidelines',
      emoji: '🤝',
      content: 'We foster a respectful community by prohibiting hate speech, harassment, and harmful content. Our goal is to create a positive space where everyone feels safe to express themselves authentically.'
    }
  ];

  const features = [
    { icon: '📍', title: 'Location-Based', description: 'Connect with your local community' },
    { icon: '😌', title: 'Mood Expression', description: 'Share different types of thoughts' },
    { icon: '👻', title: 'Anonymous', description: 'No accounts or profiles needed' },
    { icon: '🛡️', title: 'Safe Space', description: 'Moderated for positive interactions' },
    { icon: '🌐', title: 'Local First', description: 'Discover nearby voices and stories' },
    { icon: '💝', title: 'Free Forever', description: 'No ads, no premium features' }
  ];

  const team = [
    { name: 'Anonymous Developers', role: 'With love from the community' },
  ];

  const FeatureCard = ({ feature }) => (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{feature.icon}</Text>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </View>
  );

  const SectionCard = ({ section }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{section.emoji}</Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

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
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconEmoji}>🏮</Text>
          </View>
          <Text style={styles.appName}>Whisper Walls</Text>
          <Text style={styles.appTagline}>Anonymous thoughts, local connections</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionHeader}>Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </View>
        </View>

        {/* About Sections */}
        <View style={styles.aboutSections}>
          {sections.map((section, index) => (
            <SectionCard key={index} section={section} />
          ))}
        </View>

        {/* Team */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionHeader}>Created With ❤️</Text>
          {team.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <Text style={styles.teamMemberName}>{member.name}</Text>
              <Text style={styles.teamMemberRole}>{member.role}</Text>
            </View>
          ))}
        </View>

        {/* Links */}
        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://whisperwall.app/privacy')}
          >
            <Text style={styles.linkEmoji}>🔒</Text>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://whisperwall.app/terms')}
          >
            <Text style={styles.linkEmoji}>📄</Text>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('mailto:hello@whisperwall.app')}
          >
            <Text style={styles.linkEmoji}>✉️</Text>
            <Text style={styles.linkText}>Contact Us</Text>
            <Text style={styles.linkChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with passion for authentic human connection
          </Text>
          <Text style={styles.footerText}>
            © 2024 Whisper Walls
          </Text>
        </View>
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
    flex: 1,
    paddingHorizontal: SIZES.large,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: SIZES.xlarge,
    backgroundColor: 'white',
    borderRadius: SIZES.radiusLarge,
    marginTop: SIZES.large,
    ...SHADOWS.medium,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  appIconEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  appTagline: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
  },
  featuresSection: {
    marginTop: SIZES.large,
  },
  sectionHeader: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    alignItems: 'center',
    width: '48%',
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: SIZES.small,
  },
  featureTitle: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  aboutSections: {
    marginTop: SIZES.large,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  sectionEmoji: {
    fontSize: 20,
    marginRight: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionContent: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  teamSection: {
    marginTop: SIZES.large,
  },
  teamMember: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  teamMemberName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  teamMemberRole: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  linksSection: {
    marginTop: SIZES.large,
  },
  linkItem: {
    backgroundColor: 'white',
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  linkEmoji: {
    fontSize: 20,
    marginRight: SIZES.medium,
  },
  linkText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  linkChevron: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.xlarge,
    marginTop: SIZES.large,
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
});

export default AboutScreen;