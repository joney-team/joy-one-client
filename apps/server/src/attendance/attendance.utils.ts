import { CoordinatesInput } from '../locations/locations.types';

export function getDistanceInMeters(
  coord1: CoordinatesInput,
  coord2: CoordinatesInput,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const { lat: lat1, lng: lon1 } = coord1;
  const { lat: lat2, lng: lon2 } = coord2;

  const R = 6371000; // Bán kính Trái Đất theo đơn vị mét
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
