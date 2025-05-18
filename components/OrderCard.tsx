import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Package, Calendar, Truck, ArrowRight, DollarSign, Snowflake, Ruler, AlertTriangle, Clock } from 'lucide-react-native';
import { Order } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/helpers';

interface OrderCardProps {
  order: Order;
  showActions?: boolean;
  showDistance?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order,
  showActions = true,
  showDistance = false
}) => {
  const router = useRouter();
  
  const navigateToOrderDetails = () => {
    router.push(`/orders/${order.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={navigateToOrderDetails}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.orderId}>Order #{order.id.slice(-4)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      </View>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            From: {order.pickupLocation.address}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={16} color={colors.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            To: {order.deliveryLocation.address}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Package size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            {order.cargo.weight} kg, {order.cargo.volume.toFixed(1)} m³
          </Text>
        </View>
        
        {order.cargo.dimensions && (
          <View style={styles.detailItem}>
            <Ruler size={16} color={colors.gray} />
            <Text style={styles.detailText}>
              {order.cargo.dimensions.length}×{order.cargo.dimensions.width}×{order.cargo.dimensions.height} cm
            </Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Calendar size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            {formatDate(order.scheduledPickup, true)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Truck size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            {order.transporterId ? 'Assigned' : 'Unassigned'}
          </Text>
        </View>
      </View>
      
      <View style={styles.specialRequirementsContainer}>
        {order.cargo.requiresRefrigeration && (
          <View style={styles.specialRequirementBadge}>
            <Snowflake size={14} color={colors.white} />
            <Text style={styles.specialRequirementText}>Refrigerated</Text>
          </View>
        )}
        
        {order.cargo.isHazardous && (
          <View style={[styles.specialRequirementBadge, { backgroundColor: colors.warning }]}>
            <AlertTriangle size={14} color={colors.white} />
            <Text style={styles.specialRequirementText}>Hazardous</Text>
          </View>
        )}
        
        {order.cargo.isUrgent && (
          <View style={[styles.specialRequirementBadge, { backgroundColor: colors.secondary }]}>
            <Clock size={14} color={colors.white} />
            <Text style={styles.specialRequirementText}>Urgent</Text>
          </View>
        )}
      </View>
      
      {showDistance && 'distance' in order && (
        <View style={styles.distanceContainer}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.distanceText}>
            {(order as any).distance} km from your location
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        {order.price !== undefined ? (
          <Text style={styles.price}>{formatCurrency(order.price, order.currency)}</Text>
        ) : (
          <Text style={styles.noPriceText}>Awaiting price proposal</Text>
        )}
        
        {showActions && (
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={navigateToOrderDetails}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  locationContainer: {
    marginBottom: 12,
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: colors.textLight,
  },
  specialRequirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specialRequirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  specialRequirementText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  noPriceText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textLight,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});