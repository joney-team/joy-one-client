import { createContext, useContext } from "react";
import { LocationFragment } from "./graphql/fragmentLocation.graphql";
import { RawLocation } from "./locations-types";

export type RenderVnLocation = (
  location: Partial<LocationFragment> | null | undefined,
  args?: {
    shortProvine?: boolean;
    shortDistrict?: boolean;
    shortWard?: boolean;
  },
) => string;

export type GetGoogleMapLink = (
  location: Partial<LocationFragment> | string | null | undefined,
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
