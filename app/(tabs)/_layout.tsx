import React, { useEffect } from 'react';
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
        // If the user is authenticated and trying to go back to welcome screen
        if (isAuthenticated && window.location.pathname === '/') {
          // Prevent the navigation by replacing the current history entry
          window.history.replaceState(
            { fromTabs: true }, 
            '', 
            '/(tabs)'
          );
          
          // No need to call router.replace here as we've already changed the URL
          // This prevents creating additional history entries
          event.stopImmediatePropagation();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // Special handling for initial load
      if (isAuthenticated) {
        // Create a custom history state to help manage navigation
        // This replaces any existing state without adding a new entry
        window.history.replaceState(
          { inTabs: true }, 
          '', 
          window.location.pathname
        );
      }
      
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated, router]);
  
  // When tabs are first mounted, ensure we have a clean history state
  useEffect(() => {
    if (Platform.OS === 'web' && isAuthenticated) {
      // Replace the current history entry with our tabs state
      // This ensures we don't have unwanted entries in the history
      window.history.replaceState(
        { tabsRoot: true }, 
        '', 
        '/(tabs)'
      );
    }
  }, [isAuthenticated]);
  
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