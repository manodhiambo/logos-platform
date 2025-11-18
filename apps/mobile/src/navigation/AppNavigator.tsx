import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import PrayersScreen from '../screens/PrayersScreen';
import FeedScreen from '../screens/FeedScreen';
import DevotionalsScreen from '../screens/DevotionalsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📰" focused={focused} />,
          title: 'Community Feed',
        }}
      />
      <Tab.Screen
        name="Communities"
        component={CommunitiesScreen}
        options={{
          tabBarLabel: 'Communities',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏘️" focused={focused} />,
          title: 'Communities',
        }}
      />
      <Tab.Screen
        name="Prayers"
        component={PrayersScreen}
        options={{
          tabBarLabel: 'Prayers',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🙏" focused={focused} />,
          title: 'Prayer Requests',
        }}
      />
      <Tab.Screen
        name="Devotionals"
        component={DevotionalsScreen}
        options={{
          tabBarLabel: 'Devotionals',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
          title: 'Daily Devotionals',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    const seen = await SecureStore.getItemAsync('hasSeenWelcome');
    setHasSeenWelcome(seen === 'true');
  };

  if (isLoading || hasSeenWelcome === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            {!hasSeenWelcome && (
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                listeners={{
                  focus: async () => {
                    await SecureStore.setItemAsync('hasSeenWelcome', 'true');
                  },
                }}
              />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
