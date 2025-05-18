import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Navigation, MapPin, Truck } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { formatDate, calculateDistance } from '@/utils/helpers';
import { Order } from '@/types';
import WebMapView from './WebMapView';

interface MapViewProps {
  order?: Order;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    pinColor?: string;
  }>;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function MapView({ order, markers, initialRegion }: MapViewProps) {
  const [activeLocation, setActiveLocation] = useState<'pickup' | 'delivery' | 'current'>('current');
  
  // Determine if we have valid location data to show a map
  const hasValidLocationData = 
    (order && (order.pickupLocation || order.deliveryLocation || order.currentLocation)) ||
    (markers && markers.length > 0);

  // Calculate straight-line distance if we have pickup and delivery locations
  let routeDistance = 0;
  if (order?.pickupLocation?.latitude && order?.pickupLocation?.longitude &&
      order?.deliveryLocation?.latitude && order?.deliveryLocation?.longitude) {
    routeDistance = calculateDistance(
      order.pickupLocation.latitude,
      order.pickupLocation.longitude,
      order.deliveryLocation.latitude,
      order.deliveryLocation.longitude
    );
  }

  // If we don't have location data, show a placeholder
  if (!hasValidLocationData) {
    return (
      <View style={styles.mapPlaceholder}>
        <Navigation size={48} color={colors.primary} />
        <Text style={styles.mapText}>No location data available</Text>
      </View>
    );
  }

  // Get the active marker based on the selected location type
  const getActiveMarker = () => {
    if (!order) return null;
    
    switch (activeLocation) {
      case 'pickup':
        return order.pickupLocation;
      case 'delivery':
        return order.deliveryLocation;
      case 'current':
        return order.currentLocation || order.pickupLocation;
      default:
        return order.currentLocation || order.pickupLocation;
    }
  };

  // Get the center location for the map
  const getMapCenter = () => {
    const activeMarker = getActiveMarker();
    
    if (activeMarker?.latitude && activeMarker?.longitude) {
      return `${activeMarker.latitude},${activeMarker.longitude}`;
    }
    
    if (initialRegion) {
      return `${initialRegion.latitude},${initialRegion.longitude}`;
    }
    
    // Default center if nothing else is available
    return "40.7128,-74.0060";
  };

  return (
    <View style={styles.container}>
      <WebMapView mapCenter={getMapCenter()} zoom={14} />
      
      {order && (
        <View style={styles.locationToggle}>
          {order.pickupLocation && (
            <TouchableOpacity 
              style={[
                styles.toggleButton,
                activeLocation === 'pickup' && styles.activeToggleButton
              ]}
              onPress={() => setActiveLocation('pickup')}
            >
              <MapPin size={16} color={activeLocation === 'pickup' ? colors.white : colors.primary} />
              <Text style={[
                styles.toggleText,
                activeLocation === 'pickup' && styles.activeToggleText
              ]}>Pickup</Text>
            </TouchableOpacity>
          )}
          
          {order.deliveryLocation && (
            <TouchableOpacity 
              style={[
                styles.toggleButton,
                activeLocation === 'delivery' && styles.activeToggleButton
              ]}
              onPress={() => setActiveLocation('delivery')}
            >
              <MapPin size={16} color={activeLocation === 'delivery' ? colors.white : colors.secondary} />
              <Text style={[
                styles.toggleText,
                activeLocation === 'delivery' && styles.activeToggleText
              ]}>Delivery</Text>
            </TouchableOpacity>
          )}
          
          {order.currentLocation && (
            <TouchableOpacity 
              style={[
                styles.toggleButton,
                activeLocation === 'current' && styles.activeToggleButton
              ]}
              onPress={() => setActiveLocation('current')}
            >
              <Truck size={16} color={activeLocation === 'current' ? colors.white : colors.info} />
              <Text style={[
                styles.toggleText,
                activeLocation === 'current' && styles.activeToggleText
              ]}>Current</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.locationInfo}>
        {routeDistance > 0 && (
          <View style={styles.routeDistance}>
            <Text style={styles.routeDistanceText}>
              Distance: {routeDistance} km
            </Text>
          </View>
        )}
        
        {order?.pickupLocation && (
          <View style={styles.locationItem}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText}>
              Pickup: {order.pickupLocation.address}
            </Text>
          </View>
        )}
        
        {order?.deliveryLocation && (
          <View style={styles.locationItem}>
            <MapPin size={16} color={colors.secondary} />
            <Text style={styles.locationText}>
              Delivery: {order.deliveryLocation.address}
            </Text>
          </View>
        )}
        
        {order?.currentLocation && (
          <View style={styles.locationItem}>
            <Truck size={16} color={colors.info} />
            <Text style={styles.locationText}>
              Current: {order.currentLocation.address}
              {order.currentLocation.updatedAt && (
                <Text style={styles.locationUpdateText}>
                  {` (Updated: ${formatDate(order.currentLocation.updatedAt, true)})`}
                </Text>
              )}
            </Text>
          </View>
        )}
        
        {/* If we have markers but no order (for tracking screen) */}
        {!order && markers && markers.length > 0 && (
          <>
            {markers.map((marker, index) => (
              <View key={`marker-${index}`} style={styles.locationItem}>
                <MapPin size={16} color={marker.pinColor || colors.primary} />
                <Text style={styles.locationText}>
                  {marker.title}: {marker.description}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 12,
    marginBottom: 24,
  },
  locationToggle: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeToggleButton: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  activeToggleText: {
    color: colors.white,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    maxWidth: 500,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'center',
  },
  routeDistance: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  routeDistanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  locationUpdateText: {
    fontSize: 12,
    color: colors.textLight,
  },
});