// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Create context
const AppContext = createContext();

// Custom hook to use context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Mock data for development
const MOCK_WHISPERS = [
  {
    id: '1',
    text: 'A quiet corner with a book and a warm cup of tea brings peace to my restless mind.',
    mood: 'calm',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    likes: 12,
    location: { latitude: 21.1702, longitude: 72.8311 },
    distance: 150,
    userId: 'user_123'
  },
  {
    id: '2',
    text: 'Your smile is the sunrise that brightens my darkest days. Thank you for existing.',
    mood: 'love',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 25,
    location: { latitude: 21.1702, longitude: 72.8311 },
    distance: 300,
    userId: 'user_456'
  },
  {
    id: '3',
    text: 'Dear future self, remember this moment of pure happiness. Hold onto it.',
    mood: 'dear',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    likes: 15,
    location: { latitude: 21.1702, longitude: 72.8311 },
    distance: 250,
    userId: 'user_789'
  },
  {
    id: '4',
    text: 'Success isn\'t about the money, but the freedom to choose your own path.',
    mood: 'greed',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 18,
    location: { latitude: 21.1702, longitude: 72.8311 },
    distance: 400,
    userId: 'user_101'
  }
];

// App Provider Component
export const AppProvider = ({ children }) => {
  // State variables
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [whispers, setWhispers] = useState([]);
  const [selectedMood, setSelectedMood] = useState('calm');
  const [loading, setLoading] = useState(true);
  const [locationRadius, setLocationRadius] = useState(2000); // 2km default
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize app function
  const initializeApp = async () => {
    try {
      // Check if first launch
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      }

      // Initialize or get user
      await initializeUser();
      
      // Load cached whispers
      await loadCachedWhispers();
      
      // Get location (if permission already granted)
      await getCurrentLocation();
      
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize user function
  const initializeUser = async () => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        userId = generateUserId();
        await AsyncStorage.setItem('userId', userId);
      }
      
      const userData = {
        id: userId,
        isAnonymous: true,
        createdAt: new Date(),
        totalWhispers: 0,
        totalLikes: 0
      };
      
      setUser(userData);
    } catch (error) {
      console.error('User initialization error:', error);
    }
  };

  // Generate unique user ID
  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now();
  };

  // Load cached whispers
  const loadCachedWhispers = async () => {
    try {
      const cachedWhispers = await AsyncStorage.getItem('whispers');
      if (cachedWhispers) {
        setWhispers(JSON.parse(cachedWhispers));
      } else {
        // First time - use mock data
        setWhispers(MOCK_WHISPERS);
        await AsyncStorage.setItem('whispers', JSON.stringify(MOCK_WHISPERS));
      }
    } catch (error) {
      console.error('Load whispers error:', error);
      setWhispers(MOCK_WHISPERS);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          city: 'Current Location'
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await getCurrentLocation();
        return true;
      } else {
        // Set default location for Surat
        setLocation({
          latitude: 21.1702,
          longitude: 72.8311,
          city: 'Surat, Gujarat (Default)'
        });
        return false;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  // Add new whisper
  const addWhisper = async (text, mood) => {
    if (!text.trim() || !user) return false;

    try {
      const newWhisper = {
        id: Date.now().toString(),
        text: text.trim(),
        mood,
        timestamp: new Date(),
        likes: 0,
        location: location || { latitude: 21.1702, longitude: 72.8311 },
        distance: 0,
        userId: user.id
      };

      const updatedWhispers = [newWhisper, ...whispers];
      setWhispers(updatedWhispers);
      
      // Save to storage
      await AsyncStorage.setItem('whispers', JSON.stringify(updatedWhispers));
      
      // Update user stats
      const updatedUser = {
        ...user,
        totalWhispers: user.totalWhispers + 1
      };
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Add whisper error:', error);
      return false;
    }
  };

  // Like a whisper
  const likeWhisper = async (whisperId) => {
    try {
      const updatedWhispers = whispers.map(whisper => 
        whisper.id === whisperId 
          ? { ...whisper, likes: whisper.likes + 1 }
          : whisper
      );
      
      setWhispers(updatedWhispers);
      await AsyncStorage.setItem('whispers', JSON.stringify(updatedWhispers));
    } catch (error) {
      console.error('Like whisper error:', error);
    }
  };

  // Get filtered whispers based on mood and location
  const getFilteredWhispers = () => {
    return whispers
      .filter(whisper => whisper.mood === selectedMood)
      .filter(whisper => whisper.distance <= locationRadius)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Update location radius
  const updateLocationRadius = async (newRadius) => {
    setLocationRadius(newRadius);
    await AsyncStorage.setItem('locationRadius', newRadius.toString());
  };

  // Context value
  const contextValue = {
    // State
    user,
    location,
    whispers,
    selectedMood,
    loading,
    locationRadius,
    isFirstLaunch,
    
    // Actions
    setSelectedMood,
    setLocationRadius: updateLocationRadius,
    addWhisper,
    likeWhisper,
    getFilteredWhispers,
    requestLocationPermission,
    getCurrentLocation,
    setIsFirstLaunch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};