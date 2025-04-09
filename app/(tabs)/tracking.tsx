import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Truck, Clock } from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Order, Location as LocationType } from '@/types';
import { formatDate } from '@/utils/helpers';
import { geocodeAddress } from '@/utils/geocoding';
import MapView from '@/components/MapView';

export default function TrackingScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { orders, fetchOrders } = useOrderStore();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodedOrders, setGeocodedOrders] = useState<Record<string, Order>>({});
  
  // Use a ref to track initial mount
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (user) {
      // Filter orders that are in active states (accepted, pickup, in_transit)
      const filtered = orders.filter(order => 
        (order.ordererId === user.id || order.transporterId === user.id) &&
        ['accepted', 'pickup', 'in_transit'].includes(order.status)
      );
      setActiveOrders(filtered);
      
      // Set the first order as selected by default if available
      if (filtered.length > 0 && !selectedOrder) {
        setSelectedOrder(filtered[0]);
        geocodeOrderAddresses(filtered[0]);
      }
    }
  }, [user, orders]);
  
  const geocodeOrderAddresses = async (orderData: Order) => {
    // Skip if we already geocoded this order
    if (geocodedOrders[orderData.id]) {
      setSelectedOrder(geocodedOrders[orderData.id]);
      return;
    }
    
    setIsGeocodingLoading(true);
    
    try {
      const updatedLocations: {
        pickupLocation?: LocationType;
        deliveryLocation?: LocationType;
        currentLocation?: LocationType;
      } = {};
      
      // Geocode pickup location if it doesn't have coordinates
      if (orderData.pickupLocation && 
          (!orderData.pickupLocation.latitude || !orderData.pickupLocation.longitude)) {
        const pickupCoords = await geocodeAddress(orderData.pickupLocation.address);
        if (pickupCoords) {
          updatedLocations.pickupLocation = {
            ...orderData.pickupLocation,
            ...pickupCoords
          };
        }
      }
      
      // Geocode delivery location if it doesn't have coordinates
      if (orderData.deliveryLocation && 
          (!orderData.deliveryLocation.latitude || !orderData.deliveryLocation.longitude)) {
        const deliveryCoords = await geocodeAddress(orderData.deliveryLocation.address);
        if (deliveryCoords) {
          updatedLocations.deliveryLocation = {
            ...orderData.deliveryLocation,
            ...deliveryCoords
          };
        }
      }
      
      // Geocode current location if it exists and doesn't have coordinates
      if (orderData.currentLocation && 
          (!orderData.currentLocation.latitude || !orderData.currentLocation.longitude)) {
        const currentCoords = await geocodeAddress(orderData.currentLocation.address);
        if (currentCoords) {
          updatedLocations.currentLocation = {
            ...orderData.currentLocation,
            ...currentCoords
          };
        }
      }
      
      // Create updated order with geocoded locations
      const geocodedOrder = {
        ...orderData,
        ...(updatedLocations.pickupLocation && { pickupLocation: updatedLocations.pickupLocation }),
        ...(updatedLocations.deliveryLocation && { deliveryLocation: updatedLocations.deliveryLocation }),
        ...(updatedLocations.currentLocation && { currentLocation: updatedLocations.currentLocation }),
      };
      
      // Update state
      setGeocodedOrders(prev => ({
        ...prev,
        [orderData.id]: geocodedOrder
      }));
      
      setSelectedOrder(geocodedOrder);
    } catch (error) {
      console.error('Error geocoding addresses:', error);
      setSelectedOrder(orderData);
    } finally {
      setIsGeocodingLoading(false);
    }
  };
  
  const navigateToOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };
  
  const handleSelectOrder = (order: Order) => {
    geocodeOrderAddresses(order);
  };
  
  const renderOrderItem = (order: Order) => (
    <TouchableOpacity 
      style={[
        styles.orderItem,
        selectedOrder?.id === order.id && styles.selectedOrderItem
      ]}
      onPress={() => handleSelectOrder(order)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={[
          styles.orderIconContainer,
          selectedOrder?.id === order.id && styles.selectedOrderIconContainer
        ]}>
          <Truck size={20} color={colors.white} />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle}>Order #{order.id.slice(-4)}</Text>
          <Text style={[
            styles.orderStatus,
            selectedOrder?.id === order.id && styles.selectedOrderStatus
          ]}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.detailItem}>
          <MapPin size={16} color={colors.gray} />
          <Text style={styles.detailText} numberOfLines={1}>
            {order.currentLocation?.address || order.pickupLocation.address}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Clock size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            {order.currentLocation?.updatedAt 
              ? `Updated: ${formatDate(order.currentLocation.updatedAt, true)}`
              : `Pickup: ${formatDate(order.scheduledPickup, true)}`
            }
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => navigateToOrderDetails(order.id)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No active shipments</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any shipments in transit at the moment
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.mapContainer}>
        {isGeocodingLoading ? (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.mapLoadingText}>Loading map data...</Text>
          </View>
        ) : selectedOrder ? (
          <MapView order={selectedOrder} />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Select a shipment to view on map</Text>
          </View>
        )}
      </View>
      
      <View style={styles.shipmentsContainer}>
        <Text style={styles.sectionTitle}>Active Shipments</Text>
        
        {activeOrders.length > 0 ? (
          <FlatList
            data={activeOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderOrderItem(item)}
            contentContainerStyle={styles.listContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={280}
            decelerationRate="fast"
            ListEmptyComponent={renderEmptyState}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: '60%',
    width: '100%',
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    padding: 20,
  },
  shipmentsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  listContent: {
    paddingRight: 16,
  },
  orderItem: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOrderItem: {
    borderColor: colors.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedOrderIconContainer: {
    backgroundColor: colors.primary,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  selectedOrderStatus: {
    color: colors.primary,
    fontWeight: '700',
  },
  orderDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});