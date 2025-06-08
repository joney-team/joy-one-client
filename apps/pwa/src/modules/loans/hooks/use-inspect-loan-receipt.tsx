import { LoanReceiptData } from "../loans-types";

import dayjs from "dayjs";
import { ReceiptEntity, ReceiptStatus } from "../../receipts/receipts-types";
import { LoanEntity } from "../loans-types";

export const useInspectLoanReceipt = (receipt: ReceiptEntity, loan: LoanEntity) => {
  const receiptData = receipt.data as LoanReceiptData;
  const { period } = receiptData;

  const isExpireInToday = dayjs(receipt.expireAt! * 1000).isSame(dayjs(), "day");
  const isExpired =
    !!receipt.expireAt && dayjs(receipt.expireAt * 1000).isBefore(dayjs()) && receipt.status === ReceiptStatus.PENDING;
  const isLiquidation = receiptData.liquidation;
  const isPartialPayment = receiptData.partial || receiptData.remainPartial;
  const expiredDays = isExpired ? dayjs().diff(dayjs(receipt.expireAt! * 1000), "days") : 0;
  const relatedPaymentPeriod = loan.paymentPeriods?.find((v) => v.period === receiptData.period?.period);
  const paymentPeriodRate = relatedPaymentPeriod ? receipt.amount / relatedPaymentPeriod.totalAmount : 1;

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
