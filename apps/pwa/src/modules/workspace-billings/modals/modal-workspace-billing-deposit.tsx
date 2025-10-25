import { Button } from "@/components/buttons/button";
import { Checkout } from "@/components/checkout";
import { Loading } from "@/components/loading";
import { ModalTitle } from "@/components/modal-title";
import {
  createBankTransaction,
  getBankTransaction,
} from "@/modules/bank-transactions/bank-transaction-service";
import {
  BankTransactionEntity,
  BankTransactionPaymentGateway,
  BankTransactionStatus,
  BankTransactionType,
} from "@/modules/bank-transactions/bank-transaction-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { num, tl } from "@/modules/lang/lang-service";
import { onError } from "@/utils/exceptions.utils";
import { Card, em, NumberInput, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconReportMoney } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

export const ModalWorkspaceBillingDeposit: FC = () => {
  const minAmount = 50000;

  const [bankTransaction, setBankTransaction] = useState<BankTransactionEntity>();
  const [amount, setAmount] = useState(minAmount);

  const onPayment = async () => {
    if (amount < minAmount) return;
    const _bankTransaction = await createBankTransaction({
      amount,
      paymentGateway: BankTransactionPaymentGateway.PAY_OS,
      type: BankTransactionType.WORKSPACE_BILLINGS_DEPOSIT,
    });
    setBankTransaction(_bankTransaction);
  };

  useEventsListener(
    [
      EventType.BANK_TRANSACTION_CANCELLED,
      EventType.BANK_TRANSACTION_FAILED,
      EventType.BANK_TRANSACTION_PAID,
      EventType.BANK_TRANSACTION_FULFILLED,
    ],
    (ev) => {
      const _bankTransaction = ev.data as BankTransactionEntity;
      if (_bankTransaction && _bankTransaction._id === bankTransaction?._id) {
        setBankTransaction(_bankTransaction);
      }
    },
    [bankTransaction?._id]
  );

  useEffect(() => {
    if (bankTransaction?._id) {
      const onFocus = () => {
        getBankTransaction(bankTransaction._id)
          .then((res) => setBankTransaction(res))
          .catch(onError);
      };

      window.addEventListener("focus", onFocus);

      return () => {
        window.removeEventListener("focus", onFocus);
      };
    }
  }, [bankTransaction?._id]);

  return (
    <Stack>
      {(function () {
        if (bankTransaction) {
          if (bankTransaction.status === BankTransactionStatus.PAID) {
            return (
              <Stack p={16}>
                <Title ta="center" c="primary" fw={340}>
                  {tl("pay_successful")}!
                </Title>
                <Text ta="center">{tl("deposited_message")}</Text>

                <Button
                  type="submit"
                  radius={100}
                  onClick={() => modals.close("ModalWorkspaceBillingDeposit")}
                >
                  Okay!
                </Button>
              </Stack>
            );
          }

          if (bankTransaction)
            return (
              <Stack gap={16}>
                <Card withBorder p={10}>
                  <Checkout tx={bankTransaction} onBack={() => setBankTransaction(undefined)} />
                </Card>
              </Stack>
            );

          return (
            <Stack p={16}>
              <Title ta="center" c="primary" fw={700}>
                {tl("transaction_processing")}
              </Title>
              <Loading message={tl("waiting")} />
            </Stack>
          );
        }

        return (
          <Stack>
            <NumberInput
              label={tl("enter_money_amount")}
              value={amount}
              onChange={(e) => setAmount(+e)}
              min={50000}
              hideControls
            />

            <Text fz={em(13)}>{tl("validate_min_money_amount", { min: num(500000) })}</Text>

            <Button type="submit" onClick={onPayment} disabled={amount < minAmount}>
              {tl("deposit")}
            </Button>
          </Stack>
        );
      })()}
    </Stack>
  );
};

export const OnModalWorkspaceBillingDeposit = () => {
  return modals.open({
    modalId: "ModalWorkspaceBillingDeposit",
    title: <ModalTitle title={tl("deposit")} icon={IconReportMoney} />,
    children: <ModalWorkspaceBillingDeposit />,
    size: "md",
  });
};
