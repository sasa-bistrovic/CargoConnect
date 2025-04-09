import { OrderStatus, Currency } from '@/types';
import { colors } from '@/constants/colors';
import { getCurrencySymbol } from '@/constants/currencies';

export const formatDate = (dateString: string, includeTime = false): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  
  return date.toLocaleDateString('en-US', options);
};

export const formatCurrency = (amount: number | undefined, currency: string): string => {
  if (amount === undefined) return 'Price not set';
  
  const symbol = getCurrencySymbol(currency);
  
  return `${symbol}${amount.toFixed(2)}`;
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'determine_price':
      return colors.info;
    case 'accepted':
      return colors.info;
    case 'pickup':
      return colors.secondary;
    case 'in_transit':
      return colors.primary;
    case 'delivered':
      return colors.success;
    case 'cancelled':
      return colors.danger;
    default:
      return colors.gray;
  }
};

export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'PENDING';
    case 'determine_price':
      return 'PRICE PROPOSED';
    case 'accepted':
      return 'ACCEPTED';
    case 'pickup':
      return 'PICKED UP';
    case 'in_transit':
      return 'IN TRANSIT';
    case 'delivered':
      return 'DELIVERED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      // Fix: Add type assertion to handle the 'never' type issue
      return (status as string).toUpperCase();
  }
};

export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance);
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const getEstimatedDeliveryTime = (
  distance: number,
  averageSpeed = 60 // km/h
): number => {
  // Return hours
  return Math.ceil(distance / averageSpeed);
};

export const calculateTransportPrice = (
  distanceKm: number,
  weightKg: number,
  volumeM3: number,
  requiresCooling: boolean,
  isHazardous: boolean,
  isUrgent: boolean,
  basePrice: number,
  pricePerKm: number,
  pricePerKg: number,
  pricePerM3: number,
  coolingCoefficient: number,
  hazardousCoefficient: number,
  urgentCoefficient: number,
  transporterToPickupDistanceKm: number = 0,
  pricePerApproachKm: number = 0
): number => {
  let price = basePrice
    + (pricePerKm * distanceKm)
    + (pricePerKg * weightKg)
    + (pricePerM3 * volumeM3);
  
  // Add the cost for the transporter to reach the pickup location
  if (transporterToPickupDistanceKm > 0 && pricePerApproachKm > 0) {
    price += (pricePerApproachKm * transporterToPickupDistanceKm);
  }

  if (requiresCooling) {
    price *= coolingCoefficient;
  }
  if (isHazardous) {
    price *= hazardousCoefficient;
  }
  if (isUrgent) {
    price *= urgentCoefficient;
  }

  return Math.round(price * 100) / 100;
};