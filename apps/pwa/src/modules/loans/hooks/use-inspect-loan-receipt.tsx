import { LoanReceiptData } from "../loans-types";

import { ReceiptFragment } from "@/modules/receipts/graphql/fragmentReceipt.graphql";
import { DateTime } from "@joy-one/utils/date-time";
import { LoanFragment } from "../graphql/fragmentLoan.graphql";
import { ReceiptStatus } from "@/graphql/enums.graphql";

export const useInspectLoanReceipt = (
  receipt: Pick<ReceiptFragment, "data" | "expireAt" | "status" | "amount">,
  loan: LoanFragment,
) => {
  const receiptData = receipt.data as LoanReceiptData;
  const { period } = receiptData;

  const isExpireInToday = DateTime.isSame(receipt.expireAt!, new Date(), "day");
  const isExpired =
    !!receipt.expireAt &&
    DateTime.isBefore(receipt.expireAt!, new Date()) &&
    receipt.status === ReceiptStatus.Pending;
  const isLiquidation = receiptData.liquidation;
  const isPartialPayment = receiptData.partial || receiptData.remainPartial;
  const expiredDays = isExpired ? DateTime.diff(new Date(), receipt.expireAt!, "day") : 0;
  const relatedPaymentPeriod = loan.paymentPeriods?.find(
    (v) => v.period === receiptData.period?.period,
  );
  const paymentPeriodRate = relatedPaymentPeriod
    ? receipt.amount / relatedPaymentPeriod.totalAmount
    : 1;

  const getCapital = () => {
    if (receiptData.liquidation && receiptData.liquidationCalculated) {
      return receiptData.liquidationCalculated.remainCapitalAmount || 0;
    }

    return (receiptData.period?.capitalAmount || 0) * paymentPeriodRate;
  };

  const capital = getCapital();

  const getFee = () => {
    if (receiptData.liquidationCalculated) {
      const { capitalAmount, feeAmount } = receiptData.liquidationCalculated;
      return feeAmount - capitalAmount;
    }

    return receipt.amount - capital * paymentPeriodRate;
  };

  const fee = getFee();

  return {
    data: receiptData,
    fee,
    capital,
    period: period?.period || receiptData.lateInterest?.period || 0,
    receipt,
    isExpireInToday,
    isExpired,
    isLiquidation,
    isPartialPayment,
    amount: receipt.amount,
    expiredDays,
  };
};
