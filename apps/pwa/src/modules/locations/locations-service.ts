import { isDevelopment } from "@/service";
import { Coordinates } from "@/types";
import { isServer } from "@/utils/common.utils";
import { CheckInLocation } from "../hrm-timekeepings/hrm-timekeepings-types";
import { t } from "../lang/lang-service";

export const isGeolocationSupported = () => !isServer()
  && "navigator" in window
  && "geolocation" in navigator

export const getGeolocation = async () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (isGeolocationSupported()) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (isDevelopment()) localStorage.setItem('location', JSON.stringify(position));
        resolve(position)
      }, (err) => {
        if ([
          GeolocationPositionError.PERMISSION_DENIED,
          GeolocationPositionError.POSITION_UNAVAILABLE,
          GeolocationPositionError.TIMEOUT,
        ].includes(err.code as any)) {
          if (isDevelopment()) {
            // Return fake coordinates
            const location = localStorage.getItem('location');
            if (location) resolve(JSON.parse(location));
            else reject(new Error(t(`locations_error_code_${err.code}`)))
          } else {
            reject(new Error(t(`locations_error_code_${err.code}`)))
          }
        } else {
          reject(err)
        }
      })
    } else {
      reject(new Error(t('locations_unsupported_browser')))
    }
  })
}

export function calculateDistance(coords: Coordinates, compareCoords: Coordinates): number {
  const { lat: lat1, lng: lon1 } = coords;
  const { lat: lat2, lng: lon2 } = compareCoords;

  const R = 6371000; // Bán kính Trái Đất theo đơn vị mét
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function findAvailableLocationToCheckIn(coords: Coordinates, checkInLocations: CheckInLocation[]) {
  return checkInLocations.find((location) => {
    const distance = calculateDistance(coords, location.coordinates);
    return distance <= location.radius && !location.disabled;
  })
}

// export const detectEntityLocation = (address: string) => {
//   let entityLocation: LocationEntity = {};
//   const infos = address.split(',').map(v => v.trim()).reverse();
//   const province = cachedLocations.find(v => v.type === 'province' && v.name.includes(infos[0]))
//   const district = cachedLocations.find(v => v.type === 'district' && v.name.includes(infos[1]))
//   const ward = cachedLocations.find(v => v.type === 'ward' && v.name.includes(infos[2]))

//   entityLocation.provinceId = province?.id;
//   entityLocation.districtId = district?.id;
//   entityLocation.wardId = ward?.id;
//   entityLocation.address = address.split(',').slice(0, 2).join(', ');

//   return entityLocation;
// }

export const getGoogleMapLinkCoord = (coord: Coordinates) => {
  return `https://www.google.com/maps/place/${coord.lat},${coord.lng}`
}