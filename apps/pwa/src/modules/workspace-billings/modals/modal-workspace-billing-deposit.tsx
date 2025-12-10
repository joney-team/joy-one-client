"use client";

import { Button } from "@/components/buttons/button";
import { Checkout } from "@/components/checkout";
import { NumberFormat } from "@/components/format/number-format";
import { Loading } from "@/components/loading";
import { ModalHead } from "@/components/modal/modal-head";
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
import { EventType } from "@/graphql/enums.graphql";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
      EventType.BankTransactionCancelled,
      EventType.BankTransactionFailed,
      EventType.BankTransactionPaid,
      EventType.BankTransactionFulfilled,
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
                  {t`Pay successful`}!
                </Title>
                <Text ta="center">{t`Deposited message`}</Text>

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
                {t`Transaction processing`}
              </Title>
              <Loading message={t`Waiting`} />
            </Stack>
          );
        }

        return (
          <Stack>
            <NumberInput
              label={t`Enter money amount`}
              value={amount}
              onChange={(e) => setAmount(+e)}
              min={minAmount}
              hideControls
            />

            <Text fz={em(13)}>
              <Trans>
                Minimum amount{" "}
                <strong>
                  <NumberFormat value={minAmount} />
                </strong>
              </Trans>
            </Text>
            <Button type="submit" onClick={onPayment} disabled={amount < minAmount}>
              <Trans>Deposit</Trans>
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
    title: <ModalHead name={t`Deposit`} icon={IconReportMoney} />,
    children: <ModalWorkspaceBillingDeposit />,
    size: "md",
  });
};
