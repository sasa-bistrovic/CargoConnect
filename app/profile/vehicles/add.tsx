import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Truck, 
  MapPin, 
  Weight, 
  Box,
  Check,
  Snowflake,
  Ruler,
  DollarSign,
  AlertTriangle,
  Clock,
  Calculator,
  ChevronDown,
  ChevronUp,
  Globe,
  Navigation
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { VehicleType, Currency } from '@/types';
import { calculateTransportPrice } from '@/utils/helpers';
import { currencies, getCurrencySymbol } from '@/constants/currencies';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuthStore();
  
  const [vehicleType, setVehicleType] = useState<VehicleType>('truck');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [vehicleLength, setVehicleLength] = useState('');
  const [vehicleWidth, setVehicleWidth] = useState('');
  const [vehicleHeight, setVehicleHeight] = useState('');
  const [isRefrigerated, setIsRefrigerated] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  // Pricing parameters
  const [basePrice, setBasePrice] = useState('100');
  const [pricePerKm, setPricePerKm] = useState('1.5');
  const [pricePerApproachKm, setPricePerApproachKm] = useState('1.0');
  const [pricePerKg, setPricePerKg] = useState('0.2');
  const [pricePerM3, setPricePerM3] = useState('10');
  const [coolingCoefficient, setCoolingCoefficient] = useState('1.3');
  const [hazardousCoefficient, setHazardousCoefficient] = useState('1.5');
  const [urgentCoefficient, setUrgentCoefficient] = useState('1.8');
  
  // Price calculator test parameters
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [testDistanceKm, setTestDistanceKm] = useState('100');
  const [testApproachDistanceKm, setTestApproachDistanceKm] = useState('20');
  const [testWeightKg, setTestWeightKg] = useState('500');
  const [testVolumeM3, setTestVolumeM3] = useState('5');
  const [testRequiresCooling, setTestRequiresCooling] = useState(false);
  const [testIsHazardous, setTestIsHazardous] = useState(false);
  const [testIsUrgent, setTestIsUrgent] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
  // Calculate volume from dimensions
  const calculateVolume = (length: string, width: string, height: string): number => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    return l * w * h / 1000000; // Convert from cm³ to m³
  };
  
  // Get calculated volume
  const maxVolume = calculateVolume(vehicleLength, vehicleWidth, vehicleHeight);
  
  // Calculate test price whenever test parameters change
  useEffect(() => {
    calculateTestPrice();
  }, [
    testDistanceKm,
    testApproachDistanceKm,
    testWeightKg, 
    testVolumeM3, 
    testRequiresCooling, 
    testIsHazardous, 
    testIsUrgent,
    basePrice,
    pricePerKm,
    pricePerApproachKm,
    pricePerKg,
    pricePerM3,
    coolingCoefficient,
    hazardousCoefficient,
    urgentCoefficient
  ]);
  
  const calculateTestPrice = () => {
    const price = calculateTransportPrice(
      parseFloat(testDistanceKm) || 0,
      parseFloat(testWeightKg) || 0,
      parseFloat(testVolumeM3) || 0,
      testRequiresCooling,
      testIsHazardous,
      testIsUrgent,
      parseFloat(basePrice) || 0,
      parseFloat(pricePerKm) || 0,
      parseFloat(pricePerKg) || 0,
      parseFloat(pricePerM3) || 0,
      parseFloat(coolingCoefficient) || 1,
      parseFloat(hazardousCoefficient) || 1,
      parseFloat(urgentCoefficient) || 1,
      parseFloat(testApproachDistanceKm) || 0,
      parseFloat(pricePerApproachKm) || 0
    );
    
    setCalculatedPrice(price);
  };
  
  const handleAddVehicle = async () => {
    if (!user) return;
    
    // Basic validation
    if (!model || !licensePlate || !maxWeight || !vehicleLength || !vehicleWidth || !vehicleHeight || !currentLocation) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    try {
      const newVehicle = {
        id: `v${Date.now()}`,
        type: vehicleType,
        model,
        licensePlate,
        maxWeight: parseFloat(maxWeight),
        dimensions: {
          length: parseFloat(vehicleLength),
          width: parseFloat(vehicleWidth),
          height: parseFloat(vehicleHeight)
        },
        maxVolume,
        isRefrigerated,
        currentLocation: {
          address: currentLocation,
          latitude: 41.8781, // Mock coordinates
          longitude: -87.6298,
        },
        available: true,
        // Currency and pricing parameters
        currency,
        basePrice: parseFloat(basePrice),
        pricePerKm: parseFloat(pricePerKm),
        pricePerApproachKm: parseFloat(pricePerApproachKm),
        pricePerKg: parseFloat(pricePerKg),
        pricePerM3: parseFloat(pricePerM3),
        coolingCoefficient: parseFloat(coolingCoefficient),
        hazardousCoefficient: parseFloat(hazardousCoefficient),
        urgentCoefficient: parseFloat(urgentCoefficient),
      };
      
      const updatedVehicles = [...(user.vehicles || []), newVehicle];
      
      await updateUser({
        vehicles: updatedVehicles,
      });
      
      Alert.alert(
        'Vehicle Added',
        'Your vehicle has been added successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add vehicle. Please try again.');
    }
  };
  
  const vehicleTypes: VehicleType[] = ['truck', 'van', 'car', 'motorcycle'];
  
  const renderCurrencyItem = ({ item }: { item: typeof currencies[0] }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        currency === item.code && styles.currencyItemSelected
      ]}
      onPress={() => {
        setCurrency(item.code);
        setShowCurrencyModal(false);
      }}
    >
      <Text style={styles.currencySymbol}>{item.symbol}</Text>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.code}</Text>
        <Text style={styles.currencyName}>{item.name}</Text>
      </View>
      {currency === item.code && (
        <View style={styles.currencyCheckIcon}>
          <Check size={16} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          
          <View style={styles.vehicleTypesContainer}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity 
                key={type}
                style={[
                  styles.vehicleTypeOption,
                  vehicleType === type && styles.vehicleTypeSelected
                ]}
                onPress={() => setVehicleType(type)}
              >
                <View style={[
                  styles.vehicleTypeIcon,
                  vehicleType === type && styles.vehicleTypeIconSelected
                ]}>
                  <Truck 
                    size={24} 
                    color={vehicleType === type ? colors.white : colors.primary} 
                  />
                </View>
                
                <Text style={[
                  styles.vehicleTypeText,
                  vehicleType === type && styles.vehicleTypeTextSelected
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                
                {vehicleType === type && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Truck size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Vehicle Model"
              value={model}
              onChangeText={setModel}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Truck size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Weight size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Max Weight (kg)"
              value={maxWeight}
              onChangeText={setMaxWeight}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <Text style={styles.dimensionsLabel}>Vehicle Dimensions (cm)</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Length"
                value={vehicleLength}
                onChangeText={setVehicleLength}
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
                value={vehicleWidth}
                onChangeText={setVehicleWidth}
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
                value={vehicleHeight}
                onChangeText={setVehicleHeight}
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
                  {maxVolume.toFixed(2)} m³
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <Snowflake size={20} color={isRefrigerated ? colors.primary : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Refrigerated Vehicle</Text>
            <Switch
              value={isRefrigerated}
              onValueChange={setIsRefrigerated}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={isRefrigerated ? colors.primary : colors.gray}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Parameters</Text>
          
          <TouchableOpacity 
            style={styles.currencySelector}
            onPress={() => setShowCurrencyModal(true)}
          >
            <View style={styles.currencySelectorIcon}>
              <Globe size={20} color={colors.white} />
            </View>
            <View style={styles.currencySelectorContent}>
              <Text style={styles.currencySelectorLabel}>Currency</Text>
              <Text style={styles.currencySelectorValue}>
                {getCurrencySymbol(currency)} {currency}
              </Text>
            </View>
            <ChevronDown size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <DollarSign size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Base Price"
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per km"
                value={pricePerKm}
                onChangeText={setPricePerKm}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Navigation size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per approach km"
                value={pricePerApproachKm}
                onChangeText={setPricePerApproachKm}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Weight size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per kg"
                value={pricePerKg}
                onChangeText={setPricePerKg}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Box size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per m³"
                value={pricePerM3}
                onChangeText={setPricePerM3}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <Text style={styles.coefficientsLabel}>Price Multipliers</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Snowflake size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Cooling"
                value={coolingCoefficient}
                onChangeText={setCoolingCoefficient}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <AlertTriangle size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Hazardous"
                value={hazardousCoefficient}
                onChangeText={setHazardousCoefficient}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Clock size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Urgent"
              value={urgentCoefficient}
              onChangeText={setUrgentCoefficient}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.pricingInfo}>
            <Text style={styles.pricingInfoText}>
              These parameters will be used to automatically calculate transport prices based on distance, weight, volume, and special requirements.
            </Text>
          </View>
          
          {/* Price Calculator Testing Section */}
          <TouchableOpacity 
            style={styles.calculatorHeader}
            onPress={() => setShowPriceCalculator(!showPriceCalculator)}
          >
            <View style={styles.calculatorHeaderLeft}>
              <Calculator size={20} color={colors.primary} />
              <Text style={styles.calculatorTitle}>Test Price Calculator</Text>
            </View>
            {showPriceCalculator ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          {showPriceCalculator && (
            <View style={styles.calculatorContainer}>
              <Text style={styles.calculatorSubtitle}>
                Test your pricing parameters with sample cargo data
              </Text>
              
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.inputIcon}>
                    <MapPin size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Distance (km)"
                    value={testDistanceKm}
                    onChangeText={setTestDistanceKm}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.inputIcon}>
                    <Navigation size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Approach Distance (km)"
                    value={testApproachDistanceKm}
                    onChangeText={setTestApproachDistanceKm}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.inputIcon}>
                    <Weight size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Weight (kg)"
                    value={testWeightKg}
                    onChangeText={setTestWeightKg}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.inputIcon}>
                    <Box size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Volume (m³)"
                    value={testVolumeM3}
                    onChangeText={setTestVolumeM3}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchIcon}>
                  <Snowflake size={20} color={testRequiresCooling ? colors.primary : colors.gray} />
                </View>
                <Text style={styles.switchLabel}>Requires Refrigeration</Text>
                <Switch
                  value={testRequiresCooling}
                  onValueChange={setTestRequiresCooling}
                  trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
                  thumbColor={testRequiresCooling ? colors.primary : colors.gray}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchIcon}>
                  <AlertTriangle size={20} color={testIsHazardous ? colors.warning : colors.gray} />
                </View>
                <Text style={styles.switchLabel}>Hazardous Materials</Text>
                <Switch
                  value={testIsHazardous}
                  onValueChange={setTestIsHazardous}
                  trackColor={{ false: colors.lightGray, true: colors.warningLight }}
                  thumbColor={testIsHazardous ? colors.warning : colors.gray}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchIcon}>
                  <Clock size={20} color={testIsUrgent ? colors.secondary : colors.gray} />
                </View>
                <Text style={styles.switchLabel}>Urgent Delivery</Text>
                <Switch
                  value={testIsUrgent}
                  onValueChange={setTestIsUrgent}
                  trackColor={{ false: colors.lightGray, true: colors.secondaryLight }}
                  thumbColor={testIsUrgent ? colors.secondary : colors.gray}
                />
              </View>
              
              <View style={styles.calculatedPriceContainer}>
                <Text style={styles.calculatedPriceLabel}>Calculated Price:</Text>
                <Text style={styles.calculatedPriceValue}>
                  {getCurrencySymbol(currency)}{calculatedPrice !== null ? calculatedPrice.toFixed(2) : '0.00'}
                </Text>
                
                <View style={styles.priceBreakdown}>
                  <Text style={styles.priceBreakdownTitle}>Price Breakdown:</Text>
                  <Text style={styles.priceBreakdownItem}>
                    Base Price: {getCurrencySymbol(currency)}{parseFloat(basePrice).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Transport Distance: {testDistanceKm} km × {getCurrencySymbol(currency)}{pricePerKm} = {getCurrencySymbol(currency)}{(parseFloat(testDistanceKm) * parseFloat(pricePerKm)).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Approach Distance: {testApproachDistanceKm} km × {getCurrencySymbol(currency)}{pricePerApproachKm} = {getCurrencySymbol(currency)}{(parseFloat(testApproachDistanceKm) * parseFloat(pricePerApproachKm)).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Weight: {testWeightKg} kg × {getCurrencySymbol(currency)}{pricePerKg} = {getCurrencySymbol(currency)}{(parseFloat(testWeightKg) * parseFloat(pricePerKg)).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Volume: {testVolumeM3} m³ × {getCurrencySymbol(currency)}{pricePerM3} = {getCurrencySymbol(currency)}{(parseFloat(testVolumeM3) * parseFloat(pricePerM3)).toFixed(2)}
                  </Text>
                  
                  {testRequiresCooling && (
                    <Text style={styles.priceBreakdownItem}>
                      Refrigeration: ×{coolingCoefficient} multiplier
                    </Text>
                  )}
                  
                  {testIsHazardous && (
                    <Text style={styles.priceBreakdownItem}>
                      Hazardous: ×{hazardousCoefficient} multiplier
                    </Text>
                  )}
                  
                  {testIsUrgent && (
                    <Text style={styles.priceBreakdownItem}>
                      Urgent: ×{urgentCoefficient} multiplier
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Current Location"
              value={currentLocation}
              onChangeText={setCurrentLocation}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Add Vehicle" 
          onPress={handleAddVehicle}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
      
      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCurrencyModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={currencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.code}
              style={styles.currencyList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  dimensionsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  coefficientsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  vehicleTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  vehicleTypeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  vehicleTypeSelected: {
    borderColor: colors.primary,
  },
  vehicleTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vehicleTypeIconSelected: {
    backgroundColor: colors.primary,
  },
  vehicleTypeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  vehicleTypeTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
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
  pricingInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  pricingInfoText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
  // Price Calculator Styles
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculatorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  calculatorContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  calculatorSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  calculatedPriceContainer: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  calculatedPriceLabel: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 4,
  },
  calculatedPriceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 16,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.success,
    paddingTop: 12,
  },
  priceBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 8,
  },
  priceBreakdownItem: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 4,
  },
  // Currency Selector Styles
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  currencySelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencySelectorContent: {
    flex: 1,
  },
  currencySelectorLabel: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.8,
  },
  currencySelectorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  currencyList: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyItemSelected: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    width: 40,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textLight,
  },
  currencyCheckIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});