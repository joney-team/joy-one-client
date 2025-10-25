import { MantineColor } from "@mantine/core";
import { CustomerKycStatus } from "./customer-kycs-types";
import { t } from "@lingui/core/macro";

export const customerKycStatuses: Record<
  CustomerKycStatus,
  { label: () => string; color: MantineColor }
> = {
  [CustomerKycStatus.PENDING]: { label: () => t`Pending`, color: "gray" },
  [CustomerKycStatus.APPROVED]: { label: () => t`Approved`, color: "green" },
  [CustomerKycStatus.REJECTED]: { label: () => t`Rejected`, color: "red" },
};
