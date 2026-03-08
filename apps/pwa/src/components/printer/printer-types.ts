import { OrderCalculated } from "@/modules/orders/orders-management/orders-management-types";
import { ReceiptDataFragment } from "@/modules/receipts/graphql/fragmentReceipt.graphql";

export enum PrintSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export interface PrinterSettings {
  size: PrintSize;
  showLogo: boolean;
  showBankQrCode?: boolean;
  showAddress?: boolean;
  showCashier?: boolean;
  showThanks?: boolean;
  showCurrency?: boolean;
  showCustomer?: boolean;
  autoTrigger?: boolean;
}

export type PrinterEntity =
  | {
      order: OrderCalculated;
    }
  | {
      receipt: ReceiptDataFragment;
    };

export type PrinterProps = {
  autoTrigger?: boolean;
  children?:
    | React.ReactNode
    | ((props: { open: () => void; close: () => void }) => React.ReactNode);
} & PrinterEntity;

export type PrinterComponentProps = PrinterProps & {
  settings: PrinterSettings;
  qrCodeLink: string | null;
};
