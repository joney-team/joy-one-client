import { createContext, useContext } from "react";
import { Location, LocationEntity } from "./locations-types";

export type RenderVnLocation = (location: LocationEntity | null | undefined, args?: {
  shortProvine?: boolean;
  shortDistrict?: boolean;
  shortWard?: boolean;
}) => string

export type GetGoogleMapLink = (location: LocationEntity | string | null | undefined) => string

interface LocationsContextValue {
  vnLocations: Location[];
  renderVnLocation: RenderVnLocation;
  getGoogleMapLink: GetGoogleMapLink;
}

export const LocationsContext = createContext<LocationsContextValue>({
  vnLocations: [],
  renderVnLocation: () => "",
  getGoogleMapLink: () => "",
});

export const useLocations = () => useContext(LocationsContext)