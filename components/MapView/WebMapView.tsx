import React from 'react';
import { View, StyleSheet, Platform, Text, Linking, TouchableOpacity } from 'react-native';
import { ExternalLink, Navigation } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface WebMapViewProps {
  mapCenter: string;
  zoom?: number;
}

export default function WebMapView({ mapCenter, zoom = 14 }: WebMapViewProps) {
  // For web platform, we can use an iframe with Google Maps
  if (Platform.OS === 'web') {
    let mapUrl = `https://maps.google.com/maps?q=${mapCenter}&z=${zoom}&output=embed`;
    
    return (
      <View style={styles.container}>
        <iframe
          src={mapUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '12px',
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </View>
    );
  }
  
  // For mobile platforms, show a placeholder with a link to open in maps app
  const openInMapsApp = () => {
    const url = Platform.select({
      ios: `maps:?q=${mapCenter}`,
      android: `geo:${mapCenter}?q=${mapCenter}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(err => 
        console.error('An error occurred while opening maps app:', err)
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Navigation size={48} color={colors.primary} />
        <Text style={styles.placeholderText}>
          Map preview not available on mobile
        </Text>
        <TouchableOpacity style={styles.openMapsButton} onPress={openInMapsApp}>
          <Text style={styles.openMapsText}>Open in Maps App</Text>
          <ExternalLink size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  openMapsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});