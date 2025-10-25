import { MantineColor } from "@mantine/core";
import { ReceiptPaymentMethod, ReceiptStatus, ReceiptType } from "./receipts-types";
import { t } from "@lingui/core/macro";
import {
  Icon,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCash,
  IconCashBanknote,
  IconDeviceMobileDollar,
} from "@tabler/icons-react";

export const receiptTypes: Record<
  ReceiptType,
  { label: () => string; color: MantineColor; icon: Icon }
> = {
  [ReceiptType.INCOME]: {
    label: () => t`Income`,
    color: "green",
    icon: IconArrowDownLeft,
  },
  [ReceiptType.EXPENSE]: {
    label: () => t`Expense`,
    color: "red",
    icon: IconArrowUpRight,
  },
};

export const receiptStatuses: Record<ReceiptStatus, { label: () => string; color: MantineColor }> =
  {
    [ReceiptStatus.PENDING]: {
      label: () => t`Pending`,
      color: "gray",
    },
    [ReceiptStatus.PAID]: {
      label: () => t`Paid`,
      color: "green",
    },
  };

export const receiptPaymentMethods: Record<
  ReceiptPaymentMethod,
  { label: () => string; color: MantineColor; icon: Icon }
> = {
  [ReceiptPaymentMethod.CASH]: {
    label: () => t`Cash`,
    color: "green",
    icon: IconCash,
  },
  [ReceiptPaymentMethod.BANK_TRANSFER]: {
    label: () => t`Bank Transfer`,
    color: "blue",
    icon: IconDeviceMobileDollar,
  },
  [ReceiptPaymentMethod.BANK_CARD]: {
    label: () => t`Bank Card`,
    color: "purple",
    icon: IconCashBanknote,
  },
};
