import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Truck } from 'lucide-react-native';
import Head from "expo-router/head";
import { useAuthStore } from '@/store/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuthStore();
  const hasRedirectedRef = useRef(false);
  
  // Redirect authenticated users to tabs if they navigate here
  useEffect(() => {
    // Only redirect if authenticated and not already redirected
    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      
      // For web, we need to handle history differently
      if (Platform.OS === 'web') {
        // Small timeout to ensure the component is fully mounted
        // This helps prevent the "navigate before mounting" error
        setTimeout(() => {
          // Use router.push to navigate and create a history entry
          // This allows users to go back to the welcome screen if needed
          router.push('/(tabs)');
        }, 0);
      } else {
        // For native, just use push with a small delay
        setTimeout(() => {
          router.push('/(tabs)');
        }, 0);
      }
    }
  }, [isAuthenticated, router]);
  
  const handleGetStarted = () => {
    router.push('/auth/login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'web' && (
        <Head>
          <title>LogiTrack - Efficient Logistics Management Platform</title>
          <meta name="description" content="LogiTrack connects transporters with businesses needing shipping services. Track shipments in real-time, manage your logistics operations, and optimize your supply chain with our comprehensive platform." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover" />
        </Head>
      )}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Truck size={60} color={colors.white} />
          </View>
          <Text style={styles.appName}>LogiTrack</Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Efficient Logistics Management</Text>
          <Text style={styles.subtitle}>
            Connect with transporters, track shipments in real-time, and manage your logistics operations seamlessly.
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
              <Truck size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Order Transport</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondaryLight }]}>
              <Truck size={24} color={colors.secondary} />
            </View>
            <Text style={styles.featureText}>Track Shipments</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
              <Truck size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Manage Profile</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Get Started" 
          size="large"
          onPress={handleGetStarted}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
});