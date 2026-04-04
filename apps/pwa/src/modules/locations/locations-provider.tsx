import { useQuery } from "@apollo/client/react";
import { PropsWithChildren, type FC } from "react";
import GetVnLocationsDocument from "./graphql/getVnLocations.graphql";
import { GetGoogleMapLink, LocationsContext, RenderVnLocation } from "./locations-context";

export const LocationsProvider: FC<PropsWithChildren> = (props) => {
  const { data: vnLocationsData } = useQuery(GetVnLocationsDocument);

  const vnLocations = vnLocationsData?.vnLocations ?? [];

  const renderVnLocation: RenderVnLocation = (location, args) => {
    if (!location) return "";
    let address: string[] = [];

    if (location.provinceId) {
      const province = vnLocations.find((loc) => loc.id === location.provinceId);
      if (province) {
        if (args?.shortProvine) address.push(province.name.replace("Hồ Chí Minh", "HCM"));
        else address.push(province.fullName);
      }
    }

    if (location.wardId) {
      const ward = vnLocations.find((loc) => loc.id === location.wardId);
      if (ward) {
        if (args?.shortWard) address.push(`P. ${ward.name}`);
        else address.push(ward.fullName);
      }
    }

    if (location.address) address.push(location.address);
    return address.reverse().join(", ").replace(/  /g, " ");
  };

  const getGoogleMapLink: GetGoogleMapLink = (location) => {
    if (!location) return "";
    return `https://www.google.com/maps?q=${encodeURIComponent(
      typeof location === "object" ? renderVnLocation(location) : location,
    )}`;
  };

  return (
    <LocationsContext.Provider
      value={{
        vnLocations,
        renderVnLocation,
        getGoogleMapLink,
      }}
    >
      {props.children}
    </LocationsContext.Provider>
  );
};
