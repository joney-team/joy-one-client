import { ReceiptPaymentMethod, ReceiptStatus, ReceiptType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
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
  { label: MacroMessageDescriptor; color: MantineColor; icon: Icon }
> = {
  [ReceiptType.Income]: {
    label: defineMessage`Income`,
    color: "green",
    icon: IconArrowDownLeft,
  },
  [ReceiptType.Expense]: {
    label: defineMessage`Expense`,
    color: "red",
    icon: IconArrowUpRight,
  },
};

export const receiptStatuses: Record<
  ReceiptStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [ReceiptStatus.Pending]: {
    label: defineMessage`Pending`,
    color: "gray",
  },
  [ReceiptStatus.Paid]: {
    label: defineMessage`Paid`,
    color: "green",
  },
};

export const receiptPaymentMethods: Record<
  ReceiptPaymentMethod,
  { label: MacroMessageDescriptor; color: MantineColor; icon: Icon }
> = {
  [ReceiptPaymentMethod.Cash]: {
    label: defineMessage`Cash`,
    color: "green",
    icon: IconCash,
  },
  [ReceiptPaymentMethod.BankTransfer]: {
    label: defineMessage`Bank Transfer`,
    color: "blue",
    icon: IconDeviceMobileDollar,
  },
  [ReceiptPaymentMethod.BankCard]: {
    label: defineMessage`Bank Card`,
    color: "purple",
    icon: IconCashBanknote,
  },
};
