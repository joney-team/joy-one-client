import { VnLocation } from "@/graphql/types.graphql";
import { createContext, useContext } from "react";
import { LocationFragment } from "./graphql/fragmentLocation.graphql";

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
  vnLocations: VnLocation[];
  renderVnLocation: RenderVnLocation;
  getGoogleMapLink: GetGoogleMapLink;
}

export const LocationsContext = createContext<LocationsContextValue>({
  vnLocations: [],
  renderVnLocation: () => "",
  getGoogleMapLink: () => "",
});

export const useLocations = () => useContext(LocationsContext);
