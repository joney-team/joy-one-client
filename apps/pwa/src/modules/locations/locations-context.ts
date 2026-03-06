import { createContext, useContext } from "react";
import { LocationDataFragment } from "./graphql/fragmentLocation.graphql";
import { RawLocation } from "./locations-types";

export type RenderVnLocation = (
  location: Partial<LocationDataFragment> | null | undefined,
  args?: {
    shortProvine?: boolean;
    shortDistrict?: boolean;
    shortWard?: boolean;
  }
) => string;

export type GetGoogleMapLink = (
  location: Partial<LocationDataFragment> | string | null | undefined
) => string;

interface LocationsContextValue {
  vnLocations: RawLocation[];
  renderVnLocation: RenderVnLocation;
  getGoogleMapLink: GetGoogleMapLink;
}

export const LocationsContext = createContext<LocationsContextValue>({
  vnLocations: [],
  renderVnLocation: () => "",
  getGoogleMapLink: () => "",
});

export const useLocations = () => useContext(LocationsContext);
