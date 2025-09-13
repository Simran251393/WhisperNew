// src/utils/helpers.js

// Format timestamp to human readable format
export const formatTimestamp = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Distance in meters
  
  return Math.round(distance);
};

// Convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Format distance to human readable format
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${distance}m away`;
  } else {
    const km = (distance / 1000).toFixed(1);
    return `${km}km away`;
  }
};

// Validate whisper text
export const validateWhisperText = (text) => {
  const errors = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Whisper cannot be empty');
  }
  
  if (text && text.length > 400) {
    errors.push('Whisper cannot exceed 400 characters');
  }
  
  if (text && text.trim().length < 3) {
    errors.push('Whisper must be at least 3 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Simple bad word filter (basic implementation)
const BAD_WORDS = ['spam', 'hate', 'abuse']; // Add more as needed

export const containsBadWords = (text) => {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

// Generate random color from mood colors
export const getMoodColor = (mood) => {
  const moodColors = {
    calm: ['#f4cccc', '#e8b8b8'],
    love: ['#f29ecf', '#e91e63'],
    dear: ['#f7aaaa', '#ef9a9a'],
    greed: ['#e0a3a3', '#c48b8b']
  };
  
  return moodColors[mood] || moodColors.calm;
};

// Debounce function for search/input
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Check if device is tablet
export const isTablet = (screenData) => {
  const { width, height } = screenData;
  const aspectRatio = height / width;
  const minTabletWidth = 600;
  
  return width >= minTabletWidth || (width >= 500 && aspectRatio < 1.6);
};

// Format number with commas
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

// Haptic feedback helper (if expo-haptics is installed)
export const triggerHaptic = (type = 'light') => {
  // This would require expo-haptics to be installed
  // For now, we'll just log it
  console.log(`Haptic feedback: ${type}`);
};

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Color brightness check
export const isColorDark = (color) => {
  // Remove # if present
  color = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance < 0.5;
};