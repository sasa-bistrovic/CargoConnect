import { OrderStatus, UserRole, VehicleType, Currency } from '@/types';

export const mockUsers = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    password: 'password123',
    role: 'orderer' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    address: '123 Main St, New York, NY',
    providers: ['email', 'google', 'phone'],
  },
  {
    id: 'user2',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    phone: '+0987654321',
    password: 'password123',
    role: 'transporter' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    address: '456 Transport Ave, Chicago, IL',
    providers: ['email', 'microsoft'],
    vehicles: [
      {
        id: 'v1',
        type: 'truck' as VehicleType,
        model: 'Ford F-650',
        licensePlate: 'TR-1234',
        maxWeight: 10000, // in kg
        dimensions: {
          length: 650,
          width: 250,
          height: 280
        },
        maxVolume: 45, // in cubic meters
        isRefrigerated: false,
        currentLocation: {
          latitude: 41.8781,
          longitude: -87.6298,
          address: 'Chicago, IL',
        },
        available: true,
        currency: 'USD' as Currency,
        basePrice: 100,
        pricePerKm: 1.5,
        pricePerApproachKm: 1.0,
        pricePerKg: 0.2,
        pricePerM3: 10,
        coolingCoefficient: 1.3,
        hazardousCoefficient: 1.5,
        urgentCoefficient: 1.8,
      },
      {
        id: 'v2',
        type: 'van' as VehicleType,
        model: 'Mercedes Sprinter',
        licensePlate: 'TR-5678',
        maxWeight: 3500, // in kg
        dimensions: {
          length: 450,
          width: 180,
          height: 170
        },
        maxVolume: 14, // in cubic meters
        isRefrigerated: true,
        currentLocation: {
          latitude: 41.8339,
          longitude: -87.8720,
          address: 'Oak Park, IL',
        },
        available: true,
        currency: 'EUR' as Currency,
        basePrice: 90,
        pricePerKm: 1.3,
        pricePerApproachKm: 0.8,
        pricePerKg: 0.18,
        pricePerM3: 9,
        coolingCoefficient: 1.3,
        hazardousCoefficient: 1.5,
        urgentCoefficient: 1.8,
      }
    ],
  }
];

export const mockOrders = [
  {
    id: 'order1',
    ordererId: 'user1',
    status: 'pending' as OrderStatus,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    pickupLocation: {
      address: '123 Main St, New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    deliveryLocation: {
      address: '456 Delivery Ave, Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589,
    },
    cargo: {
      description: 'Office furniture',
      weight: 750, // in kg
      dimensions: {
        length: 200,
        width: 150,
        height: 180
      },
      volume: 8, // in cubic meters
      items: 12,
      requiresRefrigeration: false,
      isHazardous: false,
      isUrgent: false,
    },
    price: 450,
    currency: 'USD',
    notes: 'Please handle with care. Fragile items inside.',
    scheduledPickup: new Date(Date.now() + 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 172800000).toISOString(),
    distanceKm: 346,
  },
  {
    id: 'order2',
    ordererId: 'user1',
    transporterId: 'user2',
    transporterVehicleId: 'v1',
    status: 'determine_price' as OrderStatus,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    pickupLocation: {
      address: '789 Pickup St, Chicago, IL',
      latitude: 41.8781,
      longitude: -87.6298,
    },
    deliveryLocation: {
      address: '101 Delivery Rd, Milwaukee, WI',
      latitude: 43.0389,
      longitude: -87.9065,
    },
    cargo: {
      description: 'Construction materials',
      weight: 5000, // in kg
      dimensions: {
        length: 400,
        width: 200,
        height: 250
      },
      volume: 20, // in cubic meters
      items: 40,
      requiresRefrigeration: false,
      isHazardous: true,
      isUrgent: false,
    },
    price: 850,
    proposedPrice: 950,
    currency: 'USD',
    notes: 'Loading dock available at pickup location.',
    scheduledPickup: new Date(Date.now() + 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    distanceKm: 148,
    transporterToPickupDistanceKm: 15,
    statusUpdates: [
      {
        status: 'created',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        note: 'Order created',
      },
      {
        status: 'determine_price',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        note: 'Transporter proposed price: $950',
      }
    ]
  },
  {
    id: 'order3',
    ordererId: 'user1',
    transporterId: 'user2',
    transporterVehicleId: 'v2',
    status: 'in_transit' as OrderStatus,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    pickupLocation: {
      address: '222 Start St, Detroit, MI',
      latitude: 42.3314,
      longitude: -83.0458,
    },
    deliveryLocation: {
      address: '333 End Ave, Cleveland, OH',
      latitude: 41.4993,
      longitude: -81.6944,
    },
    cargo: {
      description: 'Frozen food products',
      weight: 1200, // in kg
      dimensions: {
        length: 180,
        width: 120,
        height: 150
      },
      volume: 6, // in cubic meters
      items: 30,
      requiresRefrigeration: true,
      isHazardous: false,
      isUrgent: true,
    },
    price: 620,
    currency: 'EUR',
    notes: 'Signature required upon delivery. Maintain temperature below 0°C.',
    scheduledPickup: new Date(Date.now() - 43200000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 43200000).toISOString(),
    distanceKm: 274,
    transporterToPickupDistanceKm: 35,
    currentLocation: {
      latitude: 41.9399,
      longitude: -82.2431,
      address: 'Toledo, OH',
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    statusUpdates: [
      {
        status: 'created',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        note: 'Order created',
      },
      {
        status: 'determine_price',
        timestamp: new Date(Date.now() - 150000000).toISOString(),
        note: 'Transporter proposed price: €620',
      },
      {
        status: 'accepted',
        timestamp: new Date(Date.now() - 129600000).toISOString(),
        note: 'Orderer accepted price: €620',
      },
      {
        status: 'pickup',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        note: 'Cargo picked up',
      },
      {
        status: 'in_transit',
        timestamp: new Date(Date.now() - 36000000).toISOString(),
        note: 'Shipment in transit',
      }
    ]
  }
];