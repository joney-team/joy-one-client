"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { useList } from "@/components/list/use-list";
import { ModalTitle } from "@/components/modal-title";
import { getView } from "@/layout/layout-service";
import {
  createBankTransaction,
  getBankTransaction,
} from "@/modules/bank-transactions/bank-transaction-service";
import {
  BankTransactionEntity,
  BankTransactionPaymentGateway,
  BankTransactionType,
} from "@/modules/bank-transactions/bank-transaction-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { getSubscriptions } from "@/modules/subscriptions/subscriptions-service";
import { SubscriptionEntity } from "@/modules/subscriptions/subscriptions-types";
import { getBillingBankAccount } from "@/modules/workspace-billings/workspace-billings-service";
import {
  calculateWorkspaceSubscriptionBillings,
  renderSubscriptionNum,
  selectWorkspaceSubscription,
} from "@/modules/workspace-subscriptions/workspace-subscriptions-service";
import { CalculateWorkspaceSubscriptionBillingResponse } from "@/modules/workspace-subscriptions/workspace-subscriptions-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { formatBytes } from "@/utils/file.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Card, em, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBox } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useState } from "react";

export const ModalWorkspaceSubscription: FC = () => {
  const workspace = useWorkspace();

  const [calculated, setCalculated] = useState<CalculateWorkspaceSubscriptionBillingResponse>();
  const [bankTransaction, setBankTransaction] = useState<BankTransactionEntity>();

  const [step, setStep] = useState<"PAYMENT" | "PROCESSING" | "COMPLETED">();

  const subscriptions = useList({
    id: "subscriptions",
    fetch: () => getSubscriptions(),
  });

  const billingBankAccount = useFetch({
    id: "billingBankAccount",
    fetch: () => getBillingBankAccount(),
  });

  const totalAmount = calculated?.totalPrice || 0;
  const totalPrice = calculated
    ? calculated.selectedSubscription.pricePerMember * (workspace.userMembers.length ?? 0)
    : 0;

  const onCalculate = async (_selectedSubscriptionId: string) => {
    if (!workspace.userMember.workspaceId) return;
    setStep("PROCESSING");
    await calculateWorkspaceSubscriptionBillings({
      workspaceId: workspace.userMember.workspaceId,
      selectedSubscriptionId: _selectedSubscriptionId,
    })
      .then((res) => setCalculated(res))
      .catch(onError);
    setStep(undefined);
  };

  const onSelectSubscription = async () => {
    if (!calculated || step === "PROCESSING") return;
    try {
      setStep("PROCESSING");
      await selectWorkspaceSubscription({ subscriptionId: calculated.selectedSubscription._id });
      setStep("COMPLETED");
    } catch (error) {
      onError(error);
      setStep("PAYMENT");
    }
  };

  const onPayment = async () => {
    if (!calculated) return;
    if (calculated.totalPrice <= 0) return setStep("PAYMENT");
    const _bankTransaction = await createBankTransaction({
      amount: totalAmount,
      paymentGateway: BankTransactionPaymentGateway.PAY_OS,
      type: BankTransactionType.WORKSPACE_BILLINGS_DEPOSIT,
    });
    setBankTransaction(_bankTransaction);
    setStep("PAYMENT");
  };

  // useEffect(() => {
  //   if (step === "PAYMENT" && workspace.balance.balance >= totalAmount) {
  //     onSelectSubscription();
  //   }
  // }, [totalAmount, workspace.balance.balance, step]);

  // useEffect(() => {
  //   if (
  //     step === "PROCESSING" &&
  //     workspace.workspaceSubscription?.subscriptionId === calculated?.selectedSubscription._id
  //   ) {
  //     setStep("COMPLETED");
  //   }
  // }, [workspace.workspaceSubscription?.subscriptionId, calculated?.selectedSubscription._id, step]);

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

  return <Stack p={16}></Stack>;
};

export const SubscriptionCard: FC<{
  subscription: SubscriptionEntity;
  onSelect?: (id: string) => Promise<any> | any;
  isUpgrade?: boolean;
  isActivated?: boolean;
}> = (props) => {
  const { subscription } = props;

  return (
    <Card key={subscription._id} withBorder radius={25}>
      <Stack gap={5} h="100%" justify="space-between">
        <Stack gap={0}>
          <Text fw={700} fz={em(28)} c={subscription.color}>
            {subscription.name}
          </Text>

          <Stack gap={0} justify="space-between">
            <Group gap={5}>
              <Text fz={em(25)} fw={500}>
                <CurrencyFormat value={subscription.pricePerMember} />
              </Text>
              {subscription.pricePerMemberNotSale && (
                <Text fz={em(13)} c="gray" td="line-through" fw={500}>
                  <CurrencyFormat value={subscription.pricePerMemberNotSale} />
                </Text>
              )}
            </Group>
            <Text fz={em(12)} c="gray">
              <Trans>Members</Trans> / <Trans>Month</Trans>
            </Text>
          </Stack>

          <Stack gap={16} mt={20}>
            <Group gap={16} justify="space-between" wrap="nowrap">
              <Text fz={em(15)} fw={400}>
                <Trans>Max members</Trans>
              </Text>
              <Text fz={em(15)} fw={700}>
                {renderSubscriptionNum(subscription.limitMembers)}
              </Text>
            </Group>
            <Group gap={16} justify="space-between" wrap="nowrap">
              <Text fz={em(15)} fw={400}>
                <Trans>Limit storage</Trans>
              </Text>
              <Text fz={em(15)} fw={700}>
                {renderSubscriptionNum(subscription.limitStorage, (v) => formatBytes(v))}
              </Text>
            </Group>
            <Group gap={16} justify="space-between" wrap="nowrap">
              <Text fz={em(15)} fw={400}>
                <Trans>Connect</Trans> Facebook Pages / Zalo OAs
              </Text>
              <Text fz={em(15)} fw={700}>
                {renderSubscriptionNum(subscription.limitSocialConnections)}
              </Text>
            </Group>
          </Stack>
        </Stack>

        {!!props.onSelect && (
          <Fragment>
            {props.isActivated ? (
              <Button
                mt={30}
                color={subscription.color}
                type="submit"
                variant="outline"
                radius={100}
              >
                <Trans>Using this subscription</Trans>
              </Button>
            ) : (
              <Button
                mt={30}
                color={subscription.color}
                type="submit"
                radius={100}
                onClick={() => props.onSelect?.(subscription._id)}
              >
                {props.isUpgrade ? <Trans>Upgrade</Trans> : <Trans>Select this subscription</Trans>}
              </Button>
            )}
          </Fragment>
        )}
      </Stack>
    </Card>
  );
};

export const OnModalWorkspaceSubscription = () => {
  return modals.open({
    modalId: "ModalWorkspaceSubscription",
    title: <ModalTitle title={t`Register subscription`} icon={IconBox} />,
    children: <ModalWorkspaceSubscription />,
    size: "auto",
    fullScreen: getView() === "mobile",
  });
};
