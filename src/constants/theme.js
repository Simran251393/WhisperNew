// src/constants/theme.js
export const COLORS = {
  primary: '#e91e63',
  primaryLight: '#f29ecf',
  primaryDark: '#ad1457',
  
  // Mood colors
  calm: {
    light: '#f4cccc',
    dark: '#e8b8b8',
    text: '#6d4c41'
  },
  love: {
    light: '#f29ecf',
    dark: '#e91e63',
    text: '#ffffff'
  },
  dear: {
    light: '#f7aaaa',
    dark: '#ef9a9a',
    text: '#d32f2f'
  },
  greed: {
    light: '#e0a3a3',
    dark: '#c48b8b',
    text: '#5d4037'
  },
  
  // Basic colors
  background: '#f8f0f0',
  backgroundLight: '#f0e8e8',
  white: '#ffffff',
  black: '#333333',
  gray: '#666666',
  lightGray: '#f0f0f0',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#888888'
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System'
};

export const SIZES = {
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  body: 16,
  caption: 14,
  small: 12,
  
  // Spacing
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
  
  // Border radius
  radius: 8,
  radiusMedium: 12,
  radiusLarge: 20,
  radiusXLarge: 25,
  
  // Screen dimensions (will be updated dynamically)
  width: 375,
  height: 667
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  medium: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5
  },
  large: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8
  }
};

export const MOODS = [
  {
    id: 'calm',
    name: 'Calm',
    emoji: '😌',
    colors: [COLORS.calm.light, COLORS.calm.dark],
    textColor: COLORS.calm.text
  },
  {
    id: 'love',
    name: 'Love',
    emoji: '❤️',
    colors: [COLORS.love.light, COLORS.love.dark],
    textColor: COLORS.love.text
  },
  {
    id: 'dear',
    name: 'Dear',
    emoji: '💭',
    colors: [COLORS.dear.light, COLORS.dear.dark],
    textColor: COLORS.dear.text
  },
  {
    id: 'greed',
    name: 'Greed',
    emoji: '💰',
    colors: [COLORS.greed.light, COLORS.greed.dark],
    textColor: COLORS.greed.text
  }
];