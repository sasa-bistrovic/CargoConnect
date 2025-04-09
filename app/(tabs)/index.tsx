import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Filter, MapPin, Search, RefreshCw } from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { OrderCard } from '@/components/OrderCard';
import { Order, UserRole } from '@/types';
import { Button } from '@/components/Button';

export default function OrdersScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { orders, isLoading, fetchOrders, getOrdersByUser, getAvailableOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [maxDistance, setMaxDistance] = useState<string>('');
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  
  // Use a ref to track initial mount
  const isInitialMount = React.useRef(true);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (user) {
      if (activeTab === 'my') {
        const userOrders = getOrdersByUser(user.id, user.role);
        setDisplayOrders(userOrders);
      } else {
        fetchAvailableOrders();
      }
    }
  }, [user, activeTab, orders]);
  
  const fetchAvailableOrders = () => {
    if (!user) return;
    
    // For transporters, get available orders sorted by distance from their location
    const transporterVehicle = user.vehicles && user.vehicles.length > 0 
      ? user.vehicles.find(v => v.available) 
      : undefined;
    
    const transporterLocation = transporterVehicle?.currentLocation;
    
    // Convert maxDistance to number if provided, otherwise use undefined
    const distanceLimit = maxDistance ? parseInt(maxDistance) : undefined;
    
    const availableOrders = getAvailableOrders(
      transporterLocation, 
      transporterVehicle,
      distanceLimit
    );
    
    setDisplayOrders(availableOrders);
    
    // Show feedback if no orders found within the distance
    if (distanceLimit && availableOrders.length === 0) {
      Alert.alert(
        "No Orders Found", 
        `No available orders found within ${distanceLimit} km of your location.`
      );
    }
  };
  
  const navigateToCreateOrder = () => {
    router.push('/orders/create');
  };
  
  const toggleDistanceFilter = () => {
    setShowDistanceFilter(!showDistanceFilter);
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'my' 
          ? "You don't have any orders yet" 
          : "No available orders at the moment"}
      </Text>
      {user?.role === 'orderer' && activeTab === 'my' && (
        <TouchableOpacity 
          style={styles.createButton}
          onPress={navigateToCreateOrder}
        >
          <Text style={styles.createButtonText}>Create New Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Handle tab change
  const handleTabChange = (tab: 'my' | 'available') => {
    setActiveTab(tab);
    // Reset display orders to prevent flashing old data
    setDisplayOrders([]);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'my' && styles.activeTab
            ]}
            onPress={() => handleTabChange('my')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'my' && styles.activeTabText
            ]}>
              My Orders
            </Text>
          </TouchableOpacity>
          
          {user?.role === 'transporter' && (
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'available' && styles.activeTab
              ]}
              onPress={() => handleTabChange('available')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'available' && styles.activeTabText
              ]}>
                Available Orders
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          {user?.role === 'transporter' && activeTab === 'available' && (
            <TouchableOpacity 
              style={[
                styles.iconButton, 
                showDistanceFilter && styles.activeIconButton
              ]}
              onPress={toggleDistanceFilter}
            >
              <Filter size={20} color={showDistanceFilter ? colors.white : colors.text} />
            </TouchableOpacity>
          )}
          
          {user?.role === 'orderer' && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.primaryIconButton]}
              onPress={navigateToCreateOrder}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {user?.role === 'transporter' && activeTab === 'available' && showDistanceFilter && (
        <View style={styles.filterContainer}>
          <View style={styles.filterInputContainer}>
            <MapPin size={16} color={colors.primary} style={styles.filterIcon} />
            <TextInput
              style={styles.filterInput}
              placeholder="Max distance in km"
              value={maxDistance}
              onChangeText={setMaxDistance}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <Button
            title="Find Orders"
            size="small"
            leftIcon={<Search size={16} color={colors.white} />}
            onPress={fetchAvailableOrders}
            style={styles.filterButton}
          />
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setMaxDistance('');
              fetchAvailableOrders();
            }}
          >
            <RefreshCw size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              showDistance={activeTab === 'available' && user?.role === 'transporter'}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconButton: {
    backgroundColor: colors.primary,
  },
  primaryIconButton: {
    backgroundColor: colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  filterIcon: {
    marginRight: 8,
  },
  filterInput: {
    flex: 1,
    height: 40,
    color: colors.text,
  },
  filterButton: {
    height: 40,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});