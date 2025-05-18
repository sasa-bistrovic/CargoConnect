import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Truck, MapPin, Weight, Box, Snowflake, Edit2, Ruler, DollarSign } from 'lucide-react-native';
import { Vehicle } from '@/types';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { getCurrencySymbol } from '@/constants/currencies';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: (vehicle: Vehicle) => void;
  selected?: boolean;
  showEditButton?: boolean;
  showPricing?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  onPress,
  selected = false,
  showEditButton = false,
  showPricing = false
}) => {
  const router = useRouter();
  
  const getVehicleIcon = () => {
    switch (vehicle.type) {
      case 'truck':
        return <Truck size={24} color={colors.primary} />;
      case 'van':
        return <Truck size={24} color={colors.primary} />;
      case 'car':
        return <Truck size={24} color={colors.primary} />;
      case 'motorcycle':
        return <Truck size={24} color={colors.primary} />;
      default:
        return <Truck size={24} color={colors.primary} />;
    }
  };
  
  const handlePress = () => {
    if (onPress) {
      onPress(vehicle);
    }
  };
  
  const handleEdit = (e: any) => {
    e.stopPropagation();
    router.push(`/profile/vehicles/edit?id=${vehicle.id}`);
  };
  
  const currencySymbol = getCurrencySymbol(vehicle.currency || 'USD');
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        selected && styles.selectedContainer,
        !vehicle.available && styles.unavailableContainer
      ]}
      onPress={handlePress}
      disabled={!vehicle.available && !onPress && !showEditButton}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getVehicleIcon()}
        </View>
        <View>
          <Text style={styles.model}>{vehicle.model}</Text>
          <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
        </View>
        <View style={styles.rightSection}>
          {showEditButton && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Edit2 size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={[
            styles.statusBadge, 
            { backgroundColor: vehicle.available ? colors.success : colors.gray }
          ]}>
            <Text style={styles.statusText}>
              {vehicle.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Weight size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            Max: {vehicle.maxWeight} kg
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Box size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            Vol: {vehicle.maxVolume.toFixed(2)} m³
          </Text>
        </View>
        {vehicle.dimensions && (
          <View style={styles.detailItem}>
            <Ruler size={16} color={colors.gray} />
            <Text style={styles.detailText}>
              {vehicle.dimensions.length}×{vehicle.dimensions.width}×{vehicle.dimensions.height} cm
            </Text>
          </View>
        )}
        {vehicle.isRefrigerated && (
          <View style={styles.refrigeratedBadge}>
            <Snowflake size={14} color={colors.white} />
            <Text style={styles.refrigeratedText}>Refrigerated</Text>
          </View>
        )}
      </View>
      
      {showPricing && (
        <View style={styles.pricingContainer}>
          <View style={styles.pricingRow}>
            <View style={styles.pricingItem}>
              <DollarSign size={14} color={colors.primary} />
              <Text style={styles.pricingText}>
                Base: {currencySymbol}{vehicle.basePrice}
              </Text>
            </View>
            <View style={styles.pricingItem}>
              <MapPin size={14} color={colors.primary} />
              <Text style={styles.pricingText}>
                Per km: {currencySymbol}{vehicle.pricePerKm}
              </Text>
            </View>
          </View>
          <View style={styles.pricingRow}>
            <View style={styles.pricingItem}>
              <Weight size={14} color={colors.primary} />
              <Text style={styles.pricingText}>
                Per kg: {currencySymbol}{vehicle.pricePerKg}
              </Text>
            </View>
            <View style={styles.pricingItem}>
              <Box size={14} color={colors.primary} />
              <Text style={styles.pricingText}>
                Per m³: {currencySymbol}{vehicle.pricePerM3}
              </Text>
            </View>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>{vehicle.currency || 'USD'}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.locationContainer}>
        <MapPin size={16} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>
          {vehicle.currentLocation.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: colors.primary,
  },
  unavailableContainer: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  licensePlate: {
    fontSize: 14,
    color: colors.textLight,
  },
  rightSection: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  refrigeratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  refrigeratedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  pricingContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pricingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  currencyBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currencyText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});