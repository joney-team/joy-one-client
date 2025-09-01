import { useLocations } from "@/modules/locations/locations-context";
import { Anchor, Group, Text, ThemeIcon } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { Fragment, type FC } from "react";
import { CustomerEntity } from "../customer-types";

interface CustomerLocationsProps {
  customer: Pick<
    CustomerEntity,
    | "location"
    | "secondaryLocation"
    | "vnLocation"
    | "vnPrevLocationFullAddress"
    | "vnPrevSecondaryLocationFullAddress"
    | "vnLocationFullAddress"
    | "vnSecondaryLocation"
  >;
}

export const CustomerLocations: FC<CustomerLocationsProps> = (props) => {
  const { getGoogleMapLink, renderVnLocation: renderLocation } = useLocations();
  const { customer } = props;

  return (
    <Fragment>
      {customer.vnLocation && Object.keys(customer.vnLocation).length > 0 && (
        <Anchor className="link" href={getGoogleMapLink(customer.vnLocation)} target="_blank">
          <Group gap={1} wrap="nowrap">
            <ThemeIcon color="dark" variant="transparent">
              <IconMapPin strokeWidth={1.5} size={18} />
            </ThemeIcon>
            <Text fz={16}>{renderLocation(customer.vnLocation) || "--"}</Text>
          </Group>
        </Anchor>
      )}
    </Fragment>
  );
};
