"use client";

import { isDevelopment } from "@/service";
import { Coordinates } from "@/types";
import { isServer } from "@/utils/common.utils";
import { t } from "@lingui/core/macro";

export const isGeolocationSupported = () =>
  !isServer() && "navigator" in window && "geolocation" in navigator;

export const getGeolocation = async () => {
  const locationErrorCodes: Record<number, string> = {
    1: t`You have not granted permission or refused to access the device location information.`,
    2: t`Failed to acquire geolocation, please try again in a few minutes.`,
    3: t`The time allowed to acquire the geolocation was reached before the information was obtained.`,
  };

  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (isGeolocationSupported()) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isDevelopment()) localStorage.setItem("location", JSON.stringify(position));
          resolve(position);
        },
        (err) => {
          if (
            [
              GeolocationPositionError.PERMISSION_DENIED,
              GeolocationPositionError.POSITION_UNAVAILABLE,
              GeolocationPositionError.TIMEOUT,
            ].includes(err.code as any)
          ) {
            if (isDevelopment()) {
              // Return fake coordinates
              const location = localStorage.getItem("location");
              if (location) resolve(JSON.parse(location));
              else reject(new Error(locationErrorCodes[err.code]));
            } else {
              reject(new Error(locationErrorCodes[err.code]));
            }
          } else {
            reject(err);
          }
        },
      );
    } else {
      reject(new Error(t`Your browser does not support geolocation.`));
    }
  });
};

export function calculateDistance(coords: Coordinates, compareCoords: Coordinates): number {
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

export const getGoogleMapLinkCoord = (coord: Coordinates) => {
  return `https://www.google.com/maps/place/${coord.lat},${coord.lng}`;
};

type GoogleMapsParsedResult = {
  placeName?: string;
  viewLat?: number;
  viewLng?: number;
  zoom?: number;
  placeLat?: number;
  placeLng?: number;
};

export function parseGoogleMapsUrl(url: string): GoogleMapsParsedResult {
  const result: GoogleMapsParsedResult = {};

  const decodedUrl = decodeURIComponent(url);

  // Extract place name from URLs like /maps/place/Place+Name/
  const placeNameMatch = decodedUrl.match(/\/maps\/place\/([^/]+)/);
  if (placeNameMatch) {
    result.placeName = placeNameMatch[1].replace(/\+/g, " ").trim();
  }

  // Extract map center coordinates and zoom from URLs like /@lat,lng,zoomz
  const atMatch = decodedUrl.match(/@([-.\d]+),([-.\d]+),([.\d]+)z/);
  if (atMatch) {
    result.viewLat = Number(atMatch[1]);
    result.viewLng = Number(atMatch[2]);
    result.zoom = Number(atMatch[3]);
  }

  // Extract place coordinates from URLs containing !3dlat!4dlng
  const placeMatch = decodedUrl.match(/!3d([-.\d]+)!4d([-.\d]+)/);
  if (placeMatch) {
    result.placeLat = Number(placeMatch[1]);
    result.placeLng = Number(placeMatch[2]);
  }

  return result;
}
