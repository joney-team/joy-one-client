import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { LoanReceiptData, LoanReceiptReport } from './loans.types';

export function isPartialPayment(receipt: ReceiptEntity) {
  return (
    receipt &&
    receipt.ref &&
    ((receipt.ref.includes('-PARTIAL') &&
      !receipt.ref.includes('-PARTIAL-NEXT')) ||
      receipt.data?.partial)
  );
}

export function getLoanReceiptReport(
  receipt: ReceiptEntity<LoanReceiptData>,
): LoanReceiptReport | null {
  if (receipt.data) {
    if (receipt.data.lateInterest) {
      return {
        period: receipt.data.lateInterest.period,
        fee: receipt.amount,
        capital: 0,
        expense: 0,
      };
    }

    const isAvancedPayment = isPartialPayment(receipt);
    if (isAvancedPayment || receipt.amount <= 0) return null;

    const capital = receipt.data.liquidation
      ? (receipt.data.liquidationCalculated.remainCapitalAmount ?? 0)
      : (receipt.data.period?.capitalAmount ?? 0);

    const fee = receipt.amount - capital;

    return {
      period: receipt.data.period?.period,
      fee,
      capital,
      expense: 0,
    };
  }

  if (receipt.amount < 0) {
    return {
      period: null,
      capital: 0,
      fee: 0,
      expense: receipt.amount,
    };
  }

  return null;
}
