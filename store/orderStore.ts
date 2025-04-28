import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Vehicle {
  id: string;
  type: string;
  model: string;
  licensePlate: string;
  maxWeight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  maxVolume: number;
  isRefrigerated: boolean;
  currentLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  available: boolean;
  currency: string;
  basePrice: number;
  pricePerKm: number;
  pricePerApproachKm: number;
  pricePerKg: number;
  pricePerM3: number;
  coolingCoefficient: number;
  hazardousCoefficient: number;
  urgentCoefficient: number;
}

export interface Order {
  id: string;
  customerId: string;
  vehicleId: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  cargo: {
    description: string;
    weight: number;
    volume: number;
    requiresCooling: boolean;
    isHazardous: boolean;
    isUrgent: boolean;
  };
  price: number;
  currency: string;
  createdAt: string;
  scheduledFor: string;
}

interface OrderState {
  vehicles: Vehicle[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  newVehicleData: Partial<Vehicle> | null;
  
  // Vehicle actions
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  
  // Order actions
  createOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  
  // Temporary state actions
  setNewVehicleData: (data: Partial<Vehicle> | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      orders: [],
      isLoading: false,
      error: null,
      newVehicleData: null,
      
      addVehicle: async (vehicle) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            vehicles: [...state.vehicles, vehicle],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add vehicle', 
            isLoading: false 
          });
        }
      },
      
      updateVehicle: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            vehicles: state.vehicles.map(vehicle => 
              vehicle.id === id ? { ...vehicle, ...data } : vehicle
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update vehicle', 
            isLoading: false 
          });
        }
      },
      
      deleteVehicle: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            vehicles: state.vehicles.filter(vehicle => vehicle.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete vehicle', 
            isLoading: false 
          });
        }
      },
      
      createOrder: async (order) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          set(state => ({
            orders: [...state.orders, order],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create order', 
            isLoading: false 
          });
        }
      },
      
      updateOrder: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === id ? { ...order, ...data } : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update order', 
            isLoading: false 
          });
        }
      },
      
      cancelOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === id ? { ...order, status: 'cancelled' } : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to cancel order', 
            isLoading: false 
          });
        }
      },
      
      setNewVehicleData: (data) => {
        set({ newVehicleData: data });
      }
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        vehicles: state.vehicles,
        orders: state.orders,
      }),
    }
  )
);