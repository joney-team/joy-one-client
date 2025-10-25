import { MantineColor } from "@mantine/core";
import { CustomerFormStatus } from "./customer-form-types";
import { t } from "@lingui/core/macro";

export const customerFormStatuses: Record<
  CustomerFormStatus,
  {
    label: () => string;
    color: MantineColor;
  }
> = {
  [CustomerFormStatus.PENDING]: {
    label: () => t`Pending`,
    color: "gray",
  },
  [CustomerFormStatus.COMPLETED]: {
    label: () => t`Completed`,
    color: "green",
  },
  [CustomerFormStatus.CANCELLED]: {
    label: () => t`Cancelled`,
    color: "red",
  },
};
