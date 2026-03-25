import { useLocations } from "@/modules/locations/locations-context";
import { Anchor, Group, Text, ThemeIcon } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { Fragment, type FC } from "react";
import { CustomerFragment } from "../graphql/fragmentCustomer.graphql";

interface CustomerLocationsProps {
  customer: Pick<
    CustomerFragment,
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
  const { getGoogleMapLink } = useLocations();
  const { customer } = props;

  return (
    <Fragment>
      {customer.vnLocationFullAddress && (
        <Anchor
          className="link"
          href={getGoogleMapLink(customer.vnLocationFullAddress)}
          target="_blank"
        >
          <Group gap={1} wrap="nowrap">
            <ThemeIcon color="dark" variant="transparent">
              <IconMapPin strokeWidth={1.5} size={18} />
            </ThemeIcon>
            <Text fz={16}>{customer.vnLocationFullAddress}</Text>
          </Group>
        </Anchor>
      )}
    </Fragment>
  );
};
