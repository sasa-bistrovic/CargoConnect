/**
 * Calculate transport price based on various parameters
 */
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
  approachDistanceKm: number = 0,
  pricePerApproachKm: number = 0
): number => {
  // Base calculation
  let price = basePrice;
  
  // Add distance cost
  price += distanceKm * pricePerKm;
  
  // Add approach distance cost if applicable
  if (approachDistanceKm > 0 && pricePerApproachKm > 0) {
    price += approachDistanceKm * pricePerApproachKm;
  }
  
  // Add weight cost
  price += weightKg * pricePerKg;
  
  // Add volume cost
  price += volumeM3 * pricePerM3;
  
  // Apply multipliers
  let multiplier = 1;
  
  if (requiresCooling && coolingCoefficient > 1) {
    multiplier *= coolingCoefficient;
  }
  
  if (isHazardous && hazardousCoefficient > 1) {
    multiplier *= hazardousCoefficient;
  }
  
  if (isUrgent && urgentCoefficient > 1) {
    multiplier *= urgentCoefficient;
  }
  
  // Apply the multiplier to the price
  price *= multiplier;
  
  // Round to 2 decimal places
  return Math.round(price * 100) / 100;
};