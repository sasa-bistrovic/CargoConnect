export type UserRole = 'orderer' | 'transporter';

export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle';

export type OrderStatus = 
  | 'pending' 
  | 'determine_price'
  | 'accepted' 
  | 'pickup' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export type StatusUpdate = {
  status: string;
  timestamp: string;
  note?: string;
  location?: Location;
};

export type Location = {
  latitude: number;
  longitude: number;
  address: string;
  updatedAt?: string;
};

export type Dimensions = {
  length: number;
  width: number;
  height: number;
};

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'INR';

export type Vehicle = {
  id: string;
  type: VehicleType;
  model: string;
  licensePlate: string;
  maxWeight: number;
  dimensions: Dimensions;
  maxVolume: number; // Calculated from dimensions
  isRefrigerated: boolean;
  currentLocation: Location;
  available: boolean;
  // Pricing parameters
  currency: Currency;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  pricePerM3: number;
  pricePerApproachKm: number; // Price per km for transporter to reach pickup location
  coolingCoefficient: number;
  hazardousCoefficient: number;
  urgentCoefficient: number;
};

export type Cargo = {
  description: string;
  weight: number;
  dimensions: Dimensions;
  volume: number; // Calculated from dimensions
  items: number;
  requiresRefrigeration: boolean;
  isHazardous: boolean;
  isUrgent: boolean;
};

export type Order = {
  id: string;
  ordererId: string;
  transporterId?: string;
  transporterVehicleId?: string;
  status: OrderStatus;
  createdAt: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  cargo: Cargo;
  price?: number; // Optional now, will be set by transporter
  proposedPrice?: number;
  currency: string;
  notes?: string;
  scheduledPickup: string;
  estimatedDelivery: string;
  currentLocation?: Location;
  statusUpdates?: StatusUpdate[];
  distanceKm?: number; // Distance between pickup and delivery
  transporterToPickupDistanceKm?: number; // Distance from transporter to pickup location
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  vehicles?: Vehicle[];
  providers?: string[];
};

export type AuthProvider = 'google' | 'microsoft' | 'apple' | 'phone' | 'email';

export type LoginCredentials = {
  email?: string;
  phone?: string;
  password?: string;
  provider: AuthProvider;
};