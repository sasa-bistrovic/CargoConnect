import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Order, OrderStatus, StatusUpdate, Location, Vehicle, Currency } from '@/types';
import { mockOrders } from '@/constants/mockData';
import { calculateDistance, calculateTransportPrice } from '@/utils/helpers';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'statusUpdates'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  updateOrderLocation: (orderId: string, location: Location) => Promise<void>;
  proposeOrderPrice: (orderId: string, price: number, transporterId: string, transporterVehicleId: string) => Promise<void>;
  acceptProposedPrice: (orderId: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByUser: (userId: string, role?: 'orderer' | 'transporter') => Order[];
  getAvailableOrders: (transporterLocation?: Location, transporterVehicle?: Vehicle, maxDistance?: number) => Order[];
  getVehicleCapacityStatus: (vehicleId: string) => { 
    remainingWeight: number; 
    remainingVolume: number; 
    assignedOrders: Order[];
  };
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,
      isLoading: false,
      error: null,
      
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would fetch from an API
          // For demo, we're using mock data
          set({ orders: mockOrders, isLoading: false });
        } catch (error) {
          set({ 
            error: 'Failed to fetch orders. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Calculate distance between pickup and delivery locations if not provided
          let distanceKm = orderData.distanceKm;
          if (!distanceKm && orderData.pickupLocation.latitude && orderData.pickupLocation.longitude &&
              orderData.deliveryLocation.latitude && orderData.deliveryLocation.longitude) {
            distanceKm = calculateDistance(
              orderData.pickupLocation.latitude,
              orderData.pickupLocation.longitude,
              orderData.deliveryLocation.latitude,
              orderData.deliveryLocation.longitude
            );
          }
          
          // Create initial status update
          const initialStatus: StatusUpdate = {
            status: orderData.status,
            timestamp: new Date().toISOString(),
            note: `Order created with status: ${orderData.status}`,
          };
          
          // If the order is already accepted (direct creation with transporter)
          let statusUpdates = [initialStatus];
          if (orderData.status === 'accepted') {
            statusUpdates.push({
              status: 'accepted',
              timestamp: new Date().toISOString(),
              note: `Order automatically accepted with price: ${orderData.price} ${orderData.currency}`,
            });
          }
          
          const newOrder: Order = {
            id: `order${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...orderData,
            distanceKm,
            statusUpdates,
          };
          
          set(state => ({
            orders: [...state.orders, newOrder],
            isLoading: false
          }));
          
          return newOrder;
        } catch (error) {
          set({ 
            error: 'Failed to create order. Please try again.', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateOrderStatus: async (orderId, status, note) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const statusUpdate: StatusUpdate = {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${status}`,
          };
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    status, 
                    statusUpdates: [...(order.statusUpdates || []), statusUpdate] 
                  } 
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: 'Failed to update order status. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      updateOrderLocation: async (orderId, location) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedLocation: Location = {
            ...location,
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { ...order, currentLocation: updatedLocation } 
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: 'Failed to update location. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      proposeOrderPrice: async (orderId, price, transporterId, transporterVehicleId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Get the vehicle to determine the currency
          const { user } = await import('@/store/authStore').then(m => m.useAuthStore.getState());
          const vehicle = user?.vehicles?.find(v => v.id === transporterVehicleId);
          const currency = vehicle?.currency || 'USD';
          
          // Calculate approach distance from transporter to pickup location
          const order = get().orders.find(o => o.id === orderId);
          let transporterToPickupDistanceKm = 0;
          
          if (order && vehicle && vehicle.currentLocation && order.pickupLocation &&
              vehicle.currentLocation.latitude && vehicle.currentLocation.longitude &&
              order.pickupLocation.latitude && order.pickupLocation.longitude) {
            transporterToPickupDistanceKm = calculateDistance(
              vehicle.currentLocation.latitude,
              vehicle.currentLocation.longitude,
              order.pickupLocation.latitude,
              order.pickupLocation.longitude
            );
          }
          
          const statusUpdate: StatusUpdate = {
            status: 'determine_price',
            timestamp: new Date().toISOString(),
            note: `Transporter proposed price: ${price} ${currency}`,
          };
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    status: 'determine_price',
                    proposedPrice: price,
                    price: price, // Set initial price to proposed price
                    transporterId,
                    transporterVehicleId,
                    currency, // Set the currency from the vehicle
                    transporterToPickupDistanceKm, // Store the approach distance
                    statusUpdates: [...(order.statusUpdates || []), statusUpdate] 
                  } 
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: 'Failed to propose price. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      acceptProposedPrice: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const order = get().orders.find(o => o.id === orderId);
          if (!order || order.proposedPrice === undefined) {
            throw new Error('No proposed price to accept');
          }
          
          const statusUpdate: StatusUpdate = {
            status: 'accepted',
            timestamp: new Date().toISOString(),
            note: `Orderer accepted price: ${order.proposedPrice} ${order.currency}`,
          };
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    status: 'accepted',
                    price: order.proposedPrice,
                    statusUpdates: [...(order.statusUpdates || []), statusUpdate] 
                  } 
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: 'Failed to accept price. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      getOrderById: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },
      
      getOrdersByUser: (userId, role) => {
        return get().orders.filter(order => {
          if (role === 'orderer') {
            return order.ordererId === userId;
          } else if (role === 'transporter') {
            return order.transporterId === userId;
          }
          return order.ordererId === userId || order.transporterId === userId;
        });
      },
      
      getAvailableOrders: (transporterLocation, transporterVehicle, maxDistance) => {
        const pendingOrders = get().orders.filter(order => order.status === 'pending');
        
        // If no transporter location provided, just return all pending orders
        if (!transporterLocation || !transporterLocation.latitude || !transporterLocation.longitude) {
          return pendingOrders;
        }
        
        // Calculate distance for each order and add it as a property
        const ordersWithDistance = pendingOrders.map(order => {
          // Skip if pickup location doesn't have coordinates
          if (!order.pickupLocation.latitude || !order.pickupLocation.longitude) {
            return { ...order, distance: Number.MAX_VALUE };
          }
          
          const distance = calculateDistance(
            transporterLocation.latitude,
            transporterLocation.longitude,
            order.pickupLocation.latitude,
            order.pickupLocation.longitude
          );
          
          return { ...order, distance };
        });
        
        // Filter by distance if maxDistance is provided
        let filteredOrders = ordersWithDistance;
        if (maxDistance && maxDistance > 0) {
          filteredOrders = ordersWithDistance.filter(order => 
            (order as any).distance <= maxDistance
          );
        }
        
        // Filter by vehicle capacity and refrigeration requirements if provided
        if (transporterVehicle) {
          filteredOrders = filteredOrders.filter(order => 
            order.cargo.weight <= transporterVehicle.maxWeight &&
            order.cargo.volume <= transporterVehicle.maxVolume &&
            (!order.cargo.requiresRefrigeration || transporterVehicle.isRefrigerated)
          );
          
          // Check vehicle's remaining capacity considering other active orders
          const capacityStatus = get().getVehicleCapacityStatus(transporterVehicle.id);
          filteredOrders = filteredOrders.filter(order => 
            order.cargo.weight <= capacityStatus.remainingWeight &&
            order.cargo.volume <= capacityStatus.remainingVolume
          );
        }
        
        // Sort by distance (closest first)
        return filteredOrders.sort((a, b) => {
          const distanceA = (a as any).distance || Number.MAX_VALUE;
          const distanceB = (b as any).distance || Number.MAX_VALUE;
          return distanceA - distanceB;
        });
      },
      
      // Function to check vehicle capacity status
      getVehicleCapacityStatus: (vehicleId) => {
        // Get all orders assigned to this vehicle that are in active status
        const activeStatuses: OrderStatus[] = ['accepted', 'pickup', 'in_transit'];
        const assignedOrders = get().orders.filter(order => 
          order.transporterVehicleId === vehicleId && 
          activeStatuses.includes(order.status)
        );
        
        // Get the vehicle from any of the assigned orders
        const vehicle = assignedOrders.length > 0 && assignedOrders[0].transporterId
          ? (() => {
              const { getAllUsers } = require('@/store/authStore').useAuthStore.getState();
              const transporter = getAllUsers().find(u => u.id === assignedOrders[0].transporterId);
              return transporter?.vehicles?.find(v => v.id === vehicleId);
            })()
          : null;
        
        if (!vehicle) {
          return { 
            remainingWeight: 0, 
            remainingVolume: 0, 
            assignedOrders: [] 
          };
        }
        
        // Calculate total weight and volume of assigned orders
        const totalWeight = assignedOrders.reduce((sum, order) => sum + order.cargo.weight, 0);
        const totalVolume = assignedOrders.reduce((sum, order) => sum + order.cargo.volume, 0);
        
        // Calculate remaining capacity
        const remainingWeight = vehicle.maxWeight - totalWeight;
        const remainingVolume = vehicle.maxVolume - totalVolume;
        
        return {
          remainingWeight,
          remainingVolume,
          assignedOrders
        };
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);