import { ResponseList } from "@/types";
import { Icon, IconArrowDownLeft, IconArrowUpRight, IconCash, IconCashBanknote, IconDeviceMobileDollar } from "@tabler/icons-react";
import { MainRequest } from "../requests/main.request";
import { CreateReceiptDto, DisbursementReceiptDto, PartialPaymentDto, PayReceiptDto, ReceiptEntity, ReceiptPaymentMethod, ReceiptStatus, ReceiptType, UpdateReceiptDto } from "./receipts-types";

export async function createReceipt(dto: CreateReceiptDto) {
  return MainRequest.post<ReceiptEntity>('/receipts', dto);
}

export async function payReceipt(id: string, dto: PayReceiptDto) {
  return MainRequest.post<ReceiptEntity>(`/receipts/${id}/pay`, dto);
}

export async function disburseReceipt(id: string, dto: DisbursementReceiptDto) {
  return MainRequest.post<ReceiptEntity>(`/receipts/${id}/disbruse`, dto);
}

export async function getReceipts<T = any>(query?: any, controller?: AbortController) {
  return MainRequest.get<ResponseList<ReceiptEntity<T>>>('/receipts', query, controller)
}

export async function getReceipt(id: string) {
  return MainRequest.get<ReceiptEntity>(`/receipts/${id}`)
}

export async function getReceiptRef(ref: string) {
  return MainRequest.get<ReceiptEntity>(`/receipts/refs/${ref}`)
}

export async function archiveReceipt(id: string) {
  return MainRequest.delete<ReceiptEntity>(`/receipts/${id}`)
}

export async function partialPaymentReceipt(id: string, dto: PartialPaymentDto) {
  return MainRequest.post<{ receipts: ReceiptEntity[] }>(`/receipts/${id}/partial-payment`, dto)
}

export async function updateReceiptPaidAt(id: string, paidAt: number) {
  return MainRequest.put<ReceiptEntity>(`/receipts/${id}/paid-at`, { paidAt })
}

export async function updateReceipt(id: string, dto: UpdateReceiptDto) {
  return MainRequest.put<ReceiptEntity>(`/receipts/${id}`, dto)
}

export const PaymentMethodIcon: {
  [key in ReceiptPaymentMethod]: Icon
} = {
  [ReceiptPaymentMethod.CASH]: IconCash,
  [ReceiptPaymentMethod.BANK_TRANSFER]: IconDeviceMobileDollar,
  [ReceiptPaymentMethod.BANK_CARD]: IconCashBanknote,
};

export function getPaymentMethodIcon(method: ReceiptPaymentMethod) {
  return PaymentMethodIcon[method];
}

export const receiptTypeIcons: {
  [key in ReceiptType]: Icon
} = {
  [ReceiptType.INCOME]: IconArrowDownLeft,
  [ReceiptType.EXPENSE]: IconArrowUpRight,
}

export const receiptTypeColors: {
  [key in ReceiptType]: string
} = {
  [ReceiptType.INCOME]: 'primary',
  [ReceiptType.EXPENSE]: 'red',
}

export const receiptTypeOptions: {
  [key in ReceiptType]: {
    color: string,
    icon: Icon,
  }
} = {
  [ReceiptType.INCOME]: {
    color: 'green',
    icon: IconArrowDownLeft,
  },
  [ReceiptType.EXPENSE]: {
    color: 'red',
    icon: IconArrowUpRight,
  },
}

export const receiptStatusOptions: {
  [key in ReceiptStatus]: {
    color: string,
  }
} = {
  [ReceiptStatus.PENDING]: {
    color: 'gray',
  },
  [ReceiptStatus.PAID]: {
    color: 'green',
  },
}

export const receiptPaymentMethodOptions: {
  [key in ReceiptPaymentMethod]: {
    color: string,
    icon: Icon,
  }
} = {
  [ReceiptPaymentMethod.CASH]: { color: 'green', icon: IconCash },
  [ReceiptPaymentMethod.BANK_TRANSFER]: { color: 'blue', icon: IconDeviceMobileDollar },
  [ReceiptPaymentMethod.BANK_CARD]: { color: 'purple', icon: IconCashBanknote },
}

export function isPartialPayment(receipt: ReceiptEntity) {
  return receipt && receipt.ref
    && ((receipt.ref.includes('-PARTIAL') && !receipt.ref.includes('-PARTIAL-NEXT')) || receipt.data?.partial);
}