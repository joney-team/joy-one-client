import { UpdateReceiptInput } from "@/graphql/types.graphql";
import { ReceiptDataFragment } from "../graphql/fragmentReceipt.graphql";

export function normalizeUpdateReceiptInput(receipt: ReceiptDataFragment): UpdateReceiptInput {
  return {
    amount: receipt.amount,
    note: receipt.note,
    paymentMethod: receipt.paymentMethod,
    expireAt: receipt.expireAt,
    data: receipt.data,
    relatedCustomerId: receipt.relatedCustomerId,
    cashierUserId: receipt.cashierUserId,
    assigneeUserIds: receipt.assigneeUserIds,
    paidAt: receipt.paidAt,
    tipAmount: receipt.tipAmount,
    isFixedAmount: receipt.isFixedAmount,
  };
}
