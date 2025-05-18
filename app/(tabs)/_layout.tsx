import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  Package, 
  Map, 
  User
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Platform, BackHandler } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isInitialMountRef = useRef(true);
  
  // Handle back button press in tabs to prevent exiting to welcome screen
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // If we're in the tabs and authenticated, prevent going back to welcome screen
        if (isAuthenticated) {
          // Stay in the current tab
          return true;
        }
        return false;
      });
      
      return () => backHandler.remove();
    }
  }, [isAuthenticated]);
  
  // Handle browser history for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // This function will run when the user navigates using browser history
      const handlePopState = (event: PopStateEvent) => {
        // Allow normal navigation - don't interfere with browser history
        // This ensures the back button works as expected
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // Special handling for initial load
      if (isAuthenticated) {
        // Create a custom history state to help manage navigation
        // This doesn't replace any existing state
        if (isInitialMountRef.current) {
          isInitialMountRef.current = false;
        }
      }
      
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated, router]);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Orders",
          tabBarLabel: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="tracking"
        options={{
          title: "Tracking",
          tabBarLabel: "Tracking",
          tabBarIcon: ({ color, size }) => (
            <Map size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}