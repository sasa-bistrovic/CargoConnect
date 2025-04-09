import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Package, 
  Calendar, 
  FileText,
  Weight,
  Box,
  Layers,
  Snowflake,
  Ruler,
  AlertTriangle,
  Clock,
  Truck,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Navigation
} from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { geocodeAddress } from '@/utils/geocoding';
import { calculateDistance, calculateTransportPrice, formatCurrency } from '@/utils/helpers';
import { VehicleCard } from '@/components/VehicleCard';
import { Vehicle, Order, Cargo, Location } from '@/types';
import Head from "expo-router/head";

// Steps in the order creation process
enum OrderCreationStep {
  CARGO_DETAILS = 0,
  LOCATIONS = 1,
  FIND_VEHICLE = 2,
  REVIEW_PRICE = 3,
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createOrder, isLoading, getAvailableOrders, getVehicleCapacityStatus } = useOrderStore();
  const allUsers = useAuthStore(state => state.getAllUsers());
  
  // Form state
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoLength, setCargoLength] = useState('');
  const [cargoWidth, setCargoWidth] = useState('');
  const [cargoHeight, setCargoHeight] = useState('');
  const [cargoItems, setCargoItems] = useState('');
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);
  const [isHazardous, setIsHazardous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  
  // Process state
  const [currentStep, setCurrentStep] = useState<OrderCreationStep>(OrderCreationStep.CARGO_DETAILS);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [searchRadius, setSearchRadius] = useState('50'); // Default 50km radius
  const [matchedVehicles, setMatchedVehicles] = useState<Array<{vehicle: Vehicle, transporter: any, price: number, approachDistance: number}>>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<{vehicle: Vehicle, transporter: any, price: number, approachDistance: number} | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isSearchingVehicles, setIsSearchingVehicles] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculate cargo volume from dimensions
  const calculateVolume = (length: string, width: string, height: string): number => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    return l * w * h / 1000000; // Convert from cm³ to m³
  };
  
  // Get calculated cargo volume
  const cargoVolume = calculateVolume(cargoLength, cargoWidth, cargoHeight);
  
  // Fix for mobile web viewport issues with keyboard
  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateViewportHeight = () => {
        setViewportHeight(window.innerHeight);
      };
      
      // Initial height
      updateViewportHeight();
      
      // Update on resize and orientation change
      window.addEventListener('resize', updateViewportHeight);
      window.addEventListener('orientationchange', updateViewportHeight);
      
      // Detect keyboard visibility on mobile web
      const detectKeyboard = () => {
        // If window height significantly decreases, keyboard is likely visible
        const isKeyboardVisible = window.innerHeight < window.outerHeight * 0.8;
        setKeyboardVisible(isKeyboardVisible);
        
        // Apply specific CSS fixes for iOS Safari
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty(
            '--keyboard-visible', 
            isKeyboardVisible ? '1' : '0'
          );
          
          // Force redraw to prevent visual glitches
          document.body.style.display = 'none';
          document.body.offsetHeight; // Trigger reflow
          document.body.style.display = '';
        }
      };
      
      window.addEventListener('resize', detectKeyboard);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('orientationchange', updateViewportHeight);
        window.removeEventListener('resize', detectKeyboard);
      };
    } else {
      // For native mobile, use Keyboard API
      const keyboardDidShow = () => setKeyboardVisible(true);
      const keyboardDidHide = () => setKeyboardVisible(false);
      
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
      
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, []);
  
  // Validate the current step and move to the next one
  const goToNextStep = async () => {
    if (currentStep === OrderCreationStep.CARGO_DETAILS) {
      // Validate cargo details
      if (!cargoDescription || !cargoWeight || !cargoLength || !cargoWidth || !cargoHeight) {
        Alert.alert('Missing Information', 'Please fill in all required cargo details');
        return;
      }
      
      // Move to locations step
      setCurrentStep(OrderCreationStep.LOCATIONS);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } 
    else if (currentStep === OrderCreationStep.LOCATIONS) {
      // Validate locations
      if (!pickupAddress || !deliveryAddress) {
        Alert.alert('Missing Information', 'Please fill in both pickup and delivery addresses');
        return;
      }
      
      try {
        setIsGeocodingLoading(true);
        
        // Geocode pickup address
        const pickup = await geocodeAddress(pickupAddress);
        if (!pickup) {
          Alert.alert('Error', 'Could not geocode pickup address. Please check and try again.');
          setIsGeocodingLoading(false);
          return;
        }
        setPickupCoords(pickup);
        
        // Geocode delivery address
        const delivery = await geocodeAddress(deliveryAddress);
        if (!delivery) {
          Alert.alert('Error', 'Could not geocode delivery address. Please check and try again.');
          setIsGeocodingLoading(false);
          return;
        }
        setDeliveryCoords(delivery);
        
        // Calculate distance between pickup and delivery
        const distance = calculateDistance(
          pickup.latitude,
          pickup.longitude,
          delivery.latitude,
          delivery.longitude
        );
        setDistanceKm(distance);
        
        setIsGeocodingLoading(false);
        
        // Move to find vehicle step
        setCurrentStep(OrderCreationStep.FIND_VEHICLE);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } catch (error) {
        setIsGeocodingLoading(false);
        Alert.alert('Error', 'Failed to geocode addresses. Please try again.');
        console.error('Geocoding error:', error);
      }
    }
    else if (currentStep === OrderCreationStep.FIND_VEHICLE) {
      // Validate search radius
      const radius = parseInt(searchRadius);
      if (isNaN(radius) || radius <= 0) {
        Alert.alert('Invalid Radius', 'Please enter a valid search radius');
        return;
      }
      
      // Find matching vehicles
      await findMatchingVehicles();
    }
    else if (currentStep === OrderCreationStep.REVIEW_PRICE) {
      // Create the order if a vehicle is selected
      if (!selectedVehicle) {
        Alert.alert('No Vehicle Selected', 'Please select a vehicle to continue');
        return;
      }
      
      await handleCreateOrder();
    }
  };
  
  // Go back to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  // Find vehicles that match the cargo requirements and are within the search radius
  const findMatchingVehicles = async () => {
    if (!user || !pickupCoords || !distanceKm) {
      Alert.alert('Error', 'Missing required information');
      return;
    }
    
    setIsSearchingVehicles(true);
    
    try {
      // Create a cargo object to check against vehicle capacity
      const cargo: Cargo = {
        description: cargoDescription,
        weight: parseFloat(cargoWeight),
        dimensions: {
          length: parseFloat(cargoLength),
          width: parseFloat(cargoWidth),
          height: parseFloat(cargoHeight)
        },
        volume: cargoVolume,
        items: parseInt(cargoItems) || 1,
        requiresRefrigeration,
        isHazardous,
        isUrgent,
      };
      
      // Create a pickup location object
      const pickupLocation: Location = {
        address: pickupAddress,
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
      };
      
      // Find all transporters with available vehicles
      const transporters = allUsers.filter(u => u.role === 'transporter' && u.vehicles && u.vehicles.length > 0);
      
      // Array to store matched vehicles with their transporters and calculated prices
      const matches: Array<{vehicle: Vehicle, transporter: any, price: number, approachDistance: number}> = [];
      
      // Check each transporter's vehicles
      for (const transporter of transporters) {
        if (!transporter.vehicles) continue;
        
        for (const vehicle of transporter.vehicles) {
          // Skip unavailable vehicles
          if (!vehicle.available) continue;
          
          // Skip vehicles that don't meet refrigeration requirements
          if (requiresRefrigeration && !vehicle.isRefrigerated) continue;
          
          // Check if vehicle has enough capacity
          if (cargo.weight > vehicle.maxWeight || cargo.volume > vehicle.maxVolume) continue;
          
          // Check vehicle's remaining capacity considering other active orders
          const capacityStatus = getVehicleCapacityStatus(vehicle.id);
          if (capacityStatus.remainingWeight < cargo.weight || capacityStatus.remainingVolume < cargo.volume) {
            continue;
          }
          
          // Calculate distance from vehicle to pickup location
          const vehicleToPickupDistance = calculateDistance(
            vehicle.currentLocation.latitude,
            vehicle.currentLocation.longitude,
            pickupCoords.latitude,
            pickupCoords.longitude
          );
          
          // Skip vehicles outside the search radius
          const radius = parseInt(searchRadius);
          if (vehicleToPickupDistance > radius) continue;
          
          // Calculate price based on the vehicle's pricing parameters, including approach distance
          const price = calculateTransportPrice(
            distanceKm,
            cargo.weight,
            cargo.volume,
            cargo.requiresRefrigeration,
            cargo.isHazardous,
            cargo.isUrgent,
            vehicle.basePrice,
            vehicle.pricePerKm,
            vehicle.pricePerKg,
            vehicle.pricePerM3,
            vehicle.coolingCoefficient,
            vehicle.hazardousCoefficient,
            vehicle.urgentCoefficient,
            vehicleToPickupDistance,
            vehicle.pricePerApproachKm || 0
          );
          
          // Add to matches
          matches.push({
            vehicle,
            transporter,
            price,
            approachDistance: vehicleToPickupDistance
          });
        }
      }
      
      // Sort matches by price (lowest first)
      matches.sort((a, b) => a.price - b.price);
      
      setMatchedVehicles(matches);
      
      // If we found matches, move to the review price step
      if (matches.length > 0) {
        // Auto-select the first (cheapest) vehicle
        setSelectedVehicle(matches[0]);
        setCurrentStep(OrderCreationStep.REVIEW_PRICE);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        Alert.alert(
          'No Matching Vehicles',
          'No vehicles found that match your requirements within the specified radius. Try increasing the search radius or modifying your cargo details.',
          [
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error finding matching vehicles:', error);
      Alert.alert('Error', 'Failed to find matching vehicles. Please try again.');
    } finally {
      setIsSearchingVehicles(false);
    }
  };
  
  // Create the order with the selected vehicle
  const handleCreateOrder = async () => {
    if (!user || !selectedVehicle || !pickupCoords || !deliveryCoords || !distanceKm) {
      Alert.alert('Error', 'Missing required information');
      return;
    }
    
    try {
      // In a real app, we would use proper date pickers
      const now = new Date();
      const scheduledPickup = pickupDate ? new Date(pickupDate).toISOString() : new Date(now.getTime() + 86400000).toISOString();
      const estimatedDelivery = new Date(now.getTime() + 172800000).toISOString();
      
      const newOrder = await createOrder({
        ordererId: user.id,
        transporterId: selectedVehicle.transporter.id,
        transporterVehicleId: selectedVehicle.vehicle.id,
        status: 'accepted', // Create as accepted since price is already agreed upon
        pickupLocation: {
          address: pickupAddress,
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
        },
        deliveryLocation: {
          address: deliveryAddress,
          latitude: deliveryCoords.latitude,
          longitude: deliveryCoords.longitude,
        },
        cargo: {
          description: cargoDescription,
          weight: parseFloat(cargoWeight),
          dimensions: {
            length: parseFloat(cargoLength),
            width: parseFloat(cargoWidth),
            height: parseFloat(cargoHeight)
          },
          volume: cargoVolume,
          items: parseInt(cargoItems) || 1,
          requiresRefrigeration,
          isHazardous,
          isUrgent,
        },
        price: selectedVehicle.price,
        currency: selectedVehicle.vehicle.currency,
        notes,
        scheduledPickup,
        estimatedDelivery,
        distanceKm,
        transporterToPickupDistanceKm: selectedVehicle.approachDistance,
      });
      
      Alert.alert(
        'Order Created',
        'Your order has been created and accepted with the selected transporter.',
        [
          { 
            text: 'View Order', 
            onPress: () => router.push(`/orders/${newOrder.id}`) 
          },
          { 
            text: 'Back to Orders', 
            onPress: () => router.back() 
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
      console.error('Create order error:', error);
    }
  };
  
  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case OrderCreationStep.CARGO_DETAILS:
        return renderCargoDetailsStep();
      case OrderCreationStep.LOCATIONS:
        return renderLocationsStep();
      case OrderCreationStep.FIND_VEHICLE:
        return renderFindVehicleStep();
      case OrderCreationStep.REVIEW_PRICE:
        return renderReviewPriceStep();
      default:
        return renderCargoDetailsStep();
    }
  };
  
  // Render the cargo details step
  const renderCargoDetailsStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Cargo Details</Text>
          <Text style={styles.stepDescription}>
            Provide information about the cargo you need to transport
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Package size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cargo Description"
              value={cargoDescription}
              onChangeText={setCargoDescription}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Weight size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              value={cargoWeight}
              onChangeText={setCargoWeight}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <Text style={styles.dimensionsLabel}>Cargo Dimensions (cm)</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Length"
                value={cargoLength}
                onChangeText={setCargoLength}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Width"
                value={cargoWidth}
                onChangeText={setCargoWidth}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Height"
                value={cargoHeight}
                onChangeText={setCargoHeight}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.volumeContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.volumeIcon}>
                <Box size={20} color={colors.white} />
              </View>
              <View style={styles.volumeContent}>
                <Text style={styles.volumeLabel}>Volume</Text>
                <Text style={styles.volumeValue}>
                  {cargoVolume.toFixed(2)} m³
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Layers size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Number of Items"
              value={cargoItems}
              onChangeText={setCargoItems}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <Snowflake size={20} color={requiresRefrigeration ? colors.primary : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Requires Refrigeration</Text>
            <Switch
              value={requiresRefrigeration}
              onValueChange={setRequiresRefrigeration}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={requiresRefrigeration ? colors.primary : colors.gray}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <AlertTriangle size={20} color={isHazardous ? colors.warning : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Hazardous Materials</Text>
            <Switch
              value={isHazardous}
              onValueChange={setIsHazardous}
              trackColor={{ false: colors.lightGray, true: colors.warningLight }}
              thumbColor={isHazardous ? colors.warning : colors.gray}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <Clock size={20} color={isUrgent ? colors.secondary : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Urgent Delivery</Text>
            <Switch
              value={isUrgent}
              onValueChange={setIsUrgent}
              trackColor={{ false: colors.lightGray, true: colors.secondaryLight }}
              thumbColor={isUrgent ? colors.secondary : colors.gray}
            />
          </View>
          
          {requiresRefrigeration && (
            <View style={styles.specialRequirementNote}>
              <Text style={styles.specialRequirementText}>
                Note: Refrigerated transport may incur additional costs.
              </Text>
            </View>
          )}
          
          {isHazardous && (
            <View style={[styles.specialRequirementNote, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.specialRequirementText, { color: colors.warning }]}>
                Note: Hazardous materials require special handling and may incur additional costs.
              </Text>
            </View>
          )}
          
          {isUrgent && (
            <View style={[styles.specialRequirementNote, { backgroundColor: colors.secondaryLight }]}>
              <Text style={[styles.specialRequirementText, { color: colors.secondary }]}>
                Note: Urgent deliveries are prioritized and may incur additional costs.
              </Text>
            </View>
          )}
        </View>
      </>
    );
  };
  
  // Render the locations step
  const renderLocationsStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Pickup & Delivery Locations</Text>
          <Text style={styles.stepDescription}>
            Specify where the cargo will be picked up and delivered
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.secondary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Delivery Address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Date (YYYY-MM-DD)"
              value={pickupDate}
              onChangeText={setPickupDate}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.textAreaContainer}>
            <View style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 12 }]}>
              <FileText size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </>
    );
  };
  
  // Render the find vehicle step
  const renderFindVehicleStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Find Available Vehicles</Text>
          <Text style={styles.stepDescription}>
            Set a search radius to find vehicles near the pickup location
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.searchRadiusContainer}>
            <Text style={styles.searchRadiusLabel}>Search Radius (km)</Text>
            <View style={styles.searchRadiusInputContainer}>
              <View style={styles.inputIcon}>
                <Search size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Search Radius"
                value={searchRadius}
                onChangeText={setSearchRadius}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          {distanceKm && (
            <View style={styles.distanceInfo}>
              <Text style={styles.distanceInfoText}>
                Total transport distance: {distanceKm} km
              </Text>
            </View>
          )}
          
          <View style={styles.cargoSummary}>
            <Text style={styles.cargoSummaryTitle}>Cargo Summary</Text>
            
            <View style={styles.cargoSummaryItem}>
              <Package size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>{cargoDescription}</Text>
            </View>
            
            <View style={styles.cargoSummaryItem}>
              <Weight size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>{cargoWeight} kg</Text>
            </View>
            
            <View style={styles.cargoSummaryItem}>
              <Box size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>{cargoVolume.toFixed(2)} m³</Text>
            </View>
            
            <View style={styles.cargoSummaryItem}>
              <Ruler size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>
                {cargoLength} × {cargoWidth} × {cargoHeight} cm
              </Text>
            </View>
            
            <View style={styles.specialRequirementsContainer}>
              {requiresRefrigeration && (
                <View style={styles.specialRequirementBadge}>
                  <Snowflake size={14} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Refrigerated</Text>
                </View>
              )}
              
              {isHazardous && (
                <View style={[styles.specialRequirementBadge, { backgroundColor: colors.warning }]}>
                  <AlertTriangle size={14} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Hazardous</Text>
                </View>
              )}
              
              {isUrgent && (
                <View style={[styles.specialRequirementBadge, { backgroundColor: colors.secondary }]}>
                  <Clock size={14} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Urgent</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.locationsSummary}>
            <Text style={styles.locationsSummaryTitle}>Locations</Text>
            
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationAddress}>{pickupAddress}</Text>
              </View>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.secondaryLight }]}>
                <MapPin size={20} color={colors.secondary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Delivery</Text>
                <Text style={styles.locationAddress}>{deliveryAddress}</Text>
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };
  
  // Render the review price step
  const renderReviewPriceStep = () => {
    if (!selectedVehicle) {
      return (
        <View style={styles.noVehicleContainer}>
          <Text style={styles.noVehicleText}>No vehicle selected. Please go back and try again.</Text>
        </View>
      );
    }
    
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Review & Confirm</Text>
          <Text style={styles.stepDescription}>
            Review the selected vehicle and price before creating your order
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Transport Price</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(selectedVehicle.price, selectedVehicle.vehicle.currency)}
            </Text>
            <Text style={styles.priceBreakdown}>
              Base price + distance ({distanceKm} km) + approach ({selectedVehicle.approachDistance} km) + weight ({cargoWeight} kg) + volume ({cargoVolume.toFixed(2)} m³)
              {requiresRefrigeration ? ' + refrigeration' : ''}
              {isHazardous ? ' + hazardous materials' : ''}
              {isUrgent ? ' + urgent delivery' : ''}
            </Text>
          </View>
          
          <Text style={styles.selectedVehicleTitle}>Selected Vehicle</Text>
          <VehicleCard 
            vehicle={selectedVehicle.vehicle}
            showPricing={true}
          />
          
          <View style={styles.approachDistanceContainer}>
            <View style={styles.approachDistanceIcon}>
              <Navigation size={20} color={colors.white} />
            </View>
            <View style={styles.approachDistanceContent}>
              <Text style={styles.approachDistanceLabel}>Approach Distance</Text>
              <Text style={styles.approachDistanceValue}>
                {selectedVehicle.approachDistance} km from transporter to pickup location
              </Text>
              <Text style={styles.approachDistanceNote}>
                {selectedVehicle.vehicle.pricePerApproachKm > 0 
                  ? `Charged at ${formatCurrency(selectedVehicle.vehicle.pricePerApproachKm, selectedVehicle.vehicle.currency)}/km`
                  : "No additional charge for approach distance"}
              </Text>
            </View>
          </View>
          
          <View style={styles.transporterInfo}>
            <View style={styles.transporterIcon}>
              <Truck size={24} color={colors.white} />
            </View>
            <View>
              <Text style={styles.transporterLabel}>Transporter</Text>
              <Text style={styles.transporterName}>{selectedVehicle.transporter.name}</Text>
            </View>
          </View>
          
          <View style={styles.otherVehiclesContainer}>
            <Text style={styles.otherVehiclesTitle}>Other Available Vehicles</Text>
            {matchedVehicles.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.otherVehiclesList}>
                {matchedVehicles
                  .filter(match => match.vehicle.id !== selectedVehicle.vehicle.id)
                  .map((match, index) => (
                    <TouchableOpacity 
                      key={match.vehicle.id} 
                      style={styles.otherVehicleItem}
                      onPress={() => setSelectedVehicle(match)}
                    >
                      <View style={styles.otherVehicleHeader}>
                        <Text style={styles.otherVehicleModel}>{match.vehicle.model}</Text>
                        <Text style={styles.otherVehiclePrice}>
                          {formatCurrency(match.price, match.vehicle.currency)}
                        </Text>
                      </View>
                      <Text style={styles.otherVehicleTransporter}>{match.transporter.name}</Text>
                      <View style={styles.otherVehicleDetails}>
                        {match.vehicle.isRefrigerated && (
                          <View style={styles.otherVehicleBadge}>
                            <Snowflake size={12} color={colors.white} />
                            <Text style={styles.otherVehicleBadgeText}>Refrigerated</Text>
                          </View>
                        )}
                        <Text style={styles.otherVehicleCapacity}>
                          {match.vehicle.maxWeight} kg, {match.vehicle.maxVolume.toFixed(1)} m³
                        </Text>
                      </View>
                      <View style={styles.otherVehicleApproach}>
                        <Navigation size={12} color={colors.textLight} />
                        <Text style={styles.otherVehicleApproachText}>
                          {match.approachDistance} km away
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            ) : (
              <Text style={styles.noOtherVehiclesText}>No other vehicles available</Text>
            )}
          </View>
          
          <View style={styles.orderSummary}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Cargo</Text>
              <Text style={styles.orderSummaryValue}>{cargoDescription}</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Weight</Text>
              <Text style={styles.orderSummaryValue}>{cargoWeight} kg</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Volume</Text>
              <Text style={styles.orderSummaryValue}>{cargoVolume.toFixed(2)} m³</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Pickup</Text>
              <Text style={styles.orderSummaryValue}>{pickupAddress}</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Delivery</Text>
              <Text style={styles.orderSummaryValue}>{deliveryAddress}</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Distance</Text>
              <Text style={styles.orderSummaryValue}>{distanceKm} km</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Price</Text>
              <Text style={styles.orderSummaryValue}>
                {formatCurrency(selectedVehicle.price, selectedVehicle.vehicle.currency)}
              </Text>
            </View>
          </View>
          
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>
              By creating this order, you agree to the price and terms. The order will be automatically accepted by the transporter.
            </Text>
          </View>
        </View>
      </>
    );
  };
  
  // Render the footer with navigation buttons
  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goToPreviousStep}
              disabled={isLoading || isGeocodingLoading || isSearchingVehicles}
            >
              <ArrowLeft size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <Button 
            title={
              currentStep === OrderCreationStep.REVIEW_PRICE 
                ? "Create Order" 
                : "Continue"
            }
            rightIcon={
              currentStep < OrderCreationStep.REVIEW_PRICE 
                ? <ArrowRight size={20} color={colors.white} />
                : <CheckCircle size={20} color={colors.white} />
            }
            onPress={goToNextStep}
            isLoading={isLoading || isGeocodingLoading || isSearchingVehicles}
            style={[
              styles.continueButton,
              currentStep === 0 && styles.fullWidthButton
            ]}
          />
        </View>
        
        {isGeocodingLoading && (
          <Text style={styles.geocodingText}>Validating addresses...</Text>
        )}
        
        {isSearchingVehicles && (
          <Text style={styles.geocodingText}>Searching for available vehicles...</Text>
        )}
        
        <View style={styles.progressContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                currentStep >= index && styles.progressDotActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <>
      {Platform.OS === 'web' && (
        <Head>
          <title>Create Order - LogiTrack</title>
          <meta name="description" content="Create a new shipping order with LogiTrack. Specify pickup and delivery locations, cargo details, and schedule your shipment." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover" />
          <style>{`
            /* Fix for mobile keyboard issues */
            :root {
              --keyboard-visible: 0;
            }
            
            @supports (-webkit-touch-callout: none) {
              /* iOS Safari specific fixes */
              .keyboard-aware-footer {
                position: sticky;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 10;
                transition: transform 0.3s ease;
              }
              
              /* When keyboard is visible, ensure footer stays visible */
              @media (max-height: 600px), (orientation: landscape) {
                .keyboard-aware-footer {
                  position: static;
                  margin-top: 16px;
                }
              }
            }
          `}</style>
        </Head>
      )}
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.mainContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollViewContent,
              { paddingBottom: 100 } // Add padding to ensure content doesn't get hidden behind the footer
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {renderCurrentStep()}
          </ScrollView>
          
          {renderFooter()}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    position: 'relative', // Important for absolute positioning of footer
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100, // Add extra padding at the bottom to account for the footer
  },
  stepHeader: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  dimensionsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: {  
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    flex: 1,
    flexShrink: 1,
    borderColor: colors.border,
    paddingHorizontal: 0,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 48,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  volumeIcon: {
    marginRight: 12,
  },
  volumeContent: {
    flex: 1,
  },
  volumeLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    flex: 1,
    height: 100,
    color: colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchIcon: {
    marginRight: 12,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  specialRequirementNote: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  specialRequirementText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  continueButton: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
  },
  geocodingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  searchRadiusContainer: {
    marginBottom: 16,
  },
  searchRadiusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  searchRadiusInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  distanceInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  cargoSummary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cargoSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  cargoSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cargoSummaryText: {
    fontSize: 14,
    color: colors.text,
  },
  specialRequirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  specialRequirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  locationsSummary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: colors.primaryLight,
    marginLeft: 20,
    marginBottom: 16,
  },
  noVehicleContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVehicleText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  priceContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  priceBreakdown: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.8,
  },
  selectedVehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  approachDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  approachDistanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  approachDistanceContent: {
    flex: 1,
  },
  approachDistanceLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  approachDistanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  approachDistanceNote: {
    fontSize: 12,
    color: colors.secondary,
    opacity: 0.8,
  },
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transporterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transporterLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  transporterName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  otherVehiclesContainer: {
    marginBottom: 24,
  },
  otherVehiclesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  otherVehiclesList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  otherVehicleItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: 200,
  },
  otherVehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  otherVehicleModel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  otherVehiclePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  otherVehicleTransporter: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  otherVehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  otherVehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  otherVehicleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  otherVehicleCapacity: {
    fontSize: 12,
    color: colors.text,
  },
  otherVehicleApproach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  otherVehicleApproachText: {
    fontSize: 12,
    color: colors.textLight,
  },
  noOtherVehiclesText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  orderSummary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  orderSummaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 80,
  },
  orderSummaryValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  confirmationContainer: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
  },
});