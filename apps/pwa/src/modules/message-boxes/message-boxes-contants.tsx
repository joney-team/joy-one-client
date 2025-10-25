import { MantineColor } from "@mantine/core";
import { MessageBoxStatus } from "./message-boxes-types";
import { t } from "@lingui/core/macro";

export const messageBoxStatuses: Record<
  MessageBoxStatus,
  { label: () => string; color: MantineColor }
> = {
  [MessageBoxStatus.WAITING]: { label: () => t`Waiting`, color: "gray" },
  [MessageBoxStatus.IN_PROGRESS]: { label: () => t`In progress`, color: "primary" },
  [MessageBoxStatus.CLOSED]: { label: () => t`Closed`, color: "green" },
  [MessageBoxStatus.EXPIRED]: { label: () => t`Expired`, color: "gray" },
};
