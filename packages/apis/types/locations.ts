export interface Coordinates {
  lat: number;
  lng: number;
}

export type LocationType = 'province' | 'district' | 'ward';

export interface Location {
  id: string;
  type: LocationType;
  name: string;
  fullName: string;
  parentId?: string;
}

export interface LocationEntity {
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  address?: string;
  coordinates?: Coordinates;
}
