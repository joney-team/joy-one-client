import axios, { AxiosError } from 'axios';
import { writeFileSync } from 'fs';
import { randomItemFromArray } from 'src/utils/array.utils';
import { generateVietnameseAddress } from 'src/utils/random.utils';
import { configs } from '../config/config';
import vnPrevLocationsData from './locations.data.json';
import {
  Coordinates,
  VnLocation,
  LocationEntity,
  LocationType,
} from './locations.types';
import vnLocationsData from './vn-locations.data.json';

export function getLocations(): { count: number; data: VnLocation[] } {
  return {
    count: vnPrevLocationsData.length,
    data: vnPrevLocationsData as VnLocation[],
  };
}

export function getVnLocations() {
  return {
    count: vnLocationsData.length,
    data: vnLocationsData as VnLocation[],
  };
}

export function randomLocation(): LocationEntity {
  const locations = getLocations();
  const provinceId = '79';
  const district = randomItemFromArray(
    locations.data.filter(
      (v) => v.type === 'district' && v.parentId === provinceId,
    ),
  );
  const ward = randomItemFromArray(
    locations.data.filter(
      (v) => v.type === 'ward' && v.parentId === district.id,
    ),
  );

  return {
    provinceId,
    districtId: district.id,
    wardId: ward.id,
    address: generateVietnameseAddress(),
  };
}

export function renderPrevVnLocation(location?: LocationEntity) {
  if (!location) return '';
  let address: string[] = [];

  if (location.provinceId) {
    const province = vnPrevLocationsData.find(
      (loc) => loc.id === location.provinceId,
    );
    if (province) address.push(province.fullName);
  }

  if (location.districtId) {
    const district = vnPrevLocationsData.find(
      (loc) => loc.id === location.districtId,
    );
    if (district) address.push(district.fullName);
  }

  if (location.wardId) {
    const ward = vnPrevLocationsData.find((loc) => loc.id === location.wardId);
    if (ward) address.push(ward.fullName);
  }

  if (location.address) address.push(location.address);

  return address.reverse().join(', ');
}

export function calculateDistance(
  coords: Coordinates,
  compareCoords: Coordinates,
): number {
  const { lat: lat1, lng: lon1 } = coords;
  const { lat: lat2, lng: lon2 } = compareCoords;

  const R = 6371000; // Bán kính Trái Đất theo đơn vị mét
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

const vnLocationsInstance = axios.create({
  baseURL: `https://tinhthanhpho.com/api/v1`,
  headers: {
    Authorization: configs.VN_LOCATIONS_API_KEY,
  },
});

export function renderVnLocation(location: LocationEntity | null | undefined) {
  if (!location) return '';
  let address: string[] = [];

  if (location.provinceId) {
    const province = vnLocationsData.find(
      (loc) => loc.id === location.provinceId,
    );
    if (province) address.push(province.fullName);
  }

  if (location.wardId) {
    const ward = vnLocationsData.find((loc) => loc.id === location.wardId);
    if (ward) address.push(ward.fullName);
  }

  if (location.address) address.push(location.address);

  return address
    .map((a) => a.trim())
    .reverse()
    .join(', ');
}

export async function crawlVnLocations() {
  const locations: VnLocation[] = [];
  const params = { page: 0, limit: 2000 };

  const provinces = await vnLocationsInstance.get(
    `https://tinhthanhpho.com/api/v1/new-provinces`,
    { params },
  );

  for (const province of provinces.data.data) {
    const locationProvince: VnLocation = {
      id: province.code,
      type: LocationType.province,
      fullName: `${province.type} ${province.name}`,
      name: province.name,
    };
    locations.push(locationProvince);

    const wards = await vnLocationsInstance.get(
      `https://tinhthanhpho.com/api/v1/new-provinces/${locationProvince.id}/wards`,
      { params },
    );
    wards.data.data.map((ward) => {
      locations.push({
        id: ward.code,
        type: LocationType.ward,
        fullName: `${ward.type} ${ward.name}`,
        name: ward.name,
        parentId: locationProvince.id,
      });
    });
  }

  writeFileSync(
    'src/locations/vn-locations.data.json',
    JSON.stringify(locations),
  );

  return {
    locations,
  };
}

export async function migrateVnLocation(
  entity: LocationEntity,
): Promise<LocationEntity> {
  try {
    const result = await vnLocationsInstance.post('/convert/address', {
      provinceCode: entity.provinceId,
      districtCode: entity.districtId,
      wardCode: entity.wardId,
      streetAddress: '',
    });

    return {
      address: entity.address,
      coordinates: entity.coordinates,
      provinceId: result.data.data.new.province.code,
      wardId: result.data.data.new.ward.code,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 422) {
      if (entity.provinceId) {
        const newProvinceId = await vnLocationsInstance
          .get(`/merge-history/province/${entity.provinceId}`)
          .then((res) => res.data.data[0].new_province_code)
          .catch(() => null);

        const newWardId = await vnLocationsInstance
          .get(`/merge-history/ward/${entity.wardId}`)
          .then((res) => res.data.data[0].new_ward_code)
          .catch(() => null);

        return {
          address: entity.address,
          provinceId: newProvinceId,
          wardId: newWardId,
        };
      }
    }

    throw error;
  }
}
