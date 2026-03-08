import { ProductType } from "@/modules/products/products-types";
import { LoanReceiptReport } from "../loans/loans-types";

export interface ReceiptProductReport {
  productId: string;
  productName: string;
  productType: ProductType;
  revenue: number;
  profit: number;
  qtySold: number;
}

export interface ReceiptReportItem {
  ref: string;
  time: number;
  userId?: string;
  relatedEntities: {
    type: "PRODUCT" | "TICKET" | "RECEIPT" | "LOAN" | "CUSTOMER" | "ORDER";
    data: any;
  }[];
  revenue: number;
  profit: number;
  loan?: LoanReceiptReport;
}

export interface ReceiptsRangeReport {
  revenue: number;
  totalRevenue: number;
  totalProfit: number;
  totalReceipts: number;
  items: ReceiptReportItem[];
  loanCapital?: number | null;
  loanFee?: number | null;
  loanExpense?: number | null;
}

export interface ReceiptsRealtimeReport {
  revenueToday: number;
}
