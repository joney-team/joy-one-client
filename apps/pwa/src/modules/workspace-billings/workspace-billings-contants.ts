import { t } from "@lingui/core/macro";
import { WorkspaceBillingStatus, WorkspaceBillingType } from "./workspace-billings-types";
import { MantineColor } from "@mantine/core";

export const workspaceBillingTypes: Record<
  WorkspaceBillingType,
  { label: () => string; color: MantineColor }
> = {
  [WorkspaceBillingType.PAYMENT]: { label: () => t`Payment`, color: "gray" },
  [WorkspaceBillingType.CASHBACK]: { label: () => t`Cashback`, color: "green" },
  [WorkspaceBillingType.DEPOSIT]: { label: () => t`Deposit`, color: "green" },
  [WorkspaceBillingType.WITHDRAW]: { label: () => t`Withdraw`, color: "red" },
};

export const workspaceBillingStatuses: Record<
  WorkspaceBillingStatus,
  { label: () => string; color: MantineColor }
> = {
  [WorkspaceBillingStatus.PENDING]: { label: () => t`Pending`, color: "orange" },
  [WorkspaceBillingStatus.PAID]: { label: () => t`Paid`, color: "green" },
};
