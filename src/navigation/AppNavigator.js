// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/theme';

// Import screens (we'll create these files next)
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddWhisperScreen from '../screens/AddWhisperScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ name, focused, emoji }) => (
  <View style={{ 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 5 
  }}>
    <Text style={{ 
      fontSize: focused ? 24 : 20,
      marginBottom: 2 
    }}>
      {emoji}
    </Text>
    <Text style={{ 
      fontSize: 11,
      color: focused ? COLORS.primary : COLORS.textMuted,
      fontWeight: focused ? '600' : '400'
    }}>
      {name}
    </Text>
  </View>
);

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
          },
        };
      },
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen 
      name="AddWhisper" 
      component={AddWhisperScreen}
      options={{
        presentation: 'modal',
      }}
    />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

// Explore Stack Navigator
const ExploreStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopColor: COLORS.lightGray,
        borderTopWidth: 1,
        paddingTop: 5,
        paddingBottom: 5,
        height: 65,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon name="Home" focused={focused} emoji="🏠" />
        ),
        tabBarLabel: () => null,
      }}
    />
    <Tab.Screen
      name="Explore"
      component={ExploreStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon name="Explore" focused={focused} emoji="🔍" />
        ),
        tabBarLabel: () => null,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon name="Profile" focused={focused} emoji="👤" />
        ),
        tabBarLabel: () => null,
      }}
    />
  </Tab.Navigator>
);

// Root Stack Navigator
const RootStack = () => {
  const { loading, isFirstLaunch, user } = useApp();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
      }}
    >
      {loading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : isFirstLaunch ? (
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      ) : (
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Main App Navigator Component
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
};

export default AppNavigator;