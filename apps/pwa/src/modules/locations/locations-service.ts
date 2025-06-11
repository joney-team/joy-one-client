import { isDevelopment } from "@/service";
import { Coordinates } from "@/types";
import { isServer } from "@/utils/common.utils";
import { useEffect, useState } from "react";
import { api } from "../apis";
import { CheckInLocation } from "../hrm-timekeepings/hrm-timekeepings-types";
import { t } from "../lang/lang-service";
import { Location, LocationEntity } from "./locations-types";

let cachedLocations: Location[] = [];

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>(cachedLocations);

  const fetchLocations = async (retryTime: number): Promise<any> => {
    if (retryTime && retryTime > 10) return false;

    return api.get('/locations')
      .then((res) => {
        setLocations(res.data);
        cachedLocations = res.data;
      })
      .catch(async () => {
        // await new Promise(r => setTimeout(r, 1000 * retryTime));
        // fetchLocations(retryTime);
      })

  }

  useEffect(() => {
    if (!cachedLocations.length) {
      fetchLocations(0)
    }
  }, [])

  return [locations, (location) => renderLocation(location)] as [Location[], (location?: LocationEntity) => string];
}

export function renderLocation(location?: LocationEntity, args?: {
  shortProvine?: boolean,
  shortDistrict?: boolean,
  shortWard?: boolean,
}) {
  if (!location) return '';
  let address: string[] = [];

  if (location.provinceId) {
    const province = cachedLocations.find((loc) => loc.id === location.provinceId);
    if (province) {
      if (args?.shortProvine) address.push(province.name)
      else address.push(province.fullName);
    }
  }

  if (location.districtId) {
    const district = cachedLocations.find((loc) => loc.id === location.districtId);
    if (district) {
      if (args?.shortDistrict) address.push(district.name)
      else address.push(district.fullName);
    }
  }

  if (location.wardId) {
    const ward = cachedLocations.find((loc) => loc.id === location.wardId);
    if (ward) {
      if (args?.shortWard) address.push(ward.name)
      else address.push(ward.fullName);
    }
  }

  if (location.address) address.push(location.address);

  return address.reverse().join(', ');
}

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

export const detectEntityLocation = (address: string) => {
  let entityLocation: LocationEntity = {};
  const infos = address.split(',').map(v => v.trim()).reverse();
  const province = cachedLocations.find(v => v.type === 'province' && v.name.includes(infos[0]))
  const district = cachedLocations.find(v => v.type === 'district' && v.name.includes(infos[1]))
  const ward = cachedLocations.find(v => v.type === 'ward' && v.name.includes(infos[2]))

  entityLocation.provinceId = province?.id;
  entityLocation.districtId = district?.id;
  entityLocation.wardId = ward?.id;
  entityLocation.address = address.split(',').slice(0, 2).join(', ');

  return entityLocation;
}

export const getGoogleMapLink = (address: string | LocationEntity) => {
  return `https://www.google.com/maps?q=${encodeURIComponent(typeof address === 'object' ? renderLocation(address) : address)}`
}

export const getGoogleMapLinkCoord = (coord: Coordinates) => {
  return `https://www.google.com/maps/place/${coord.lat},${coord.lng}`
}