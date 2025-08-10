"use client";

import { Button } from "@/components/buttons/button";
import { Checkout } from "@/components/checkout";
import { Errored } from "@/components/errored";
import { Loading } from "@/components/loading";
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
import { renderDate, num, t } from "@/modules/lang/lang-service";
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
import { useList } from "@/components/list/use-list";
import {
  Anchor,
  Badge,
  Card,
  em,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconArrowRight, IconBox, IconConfetti } from "@tabler/icons-react";
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

  return (
    <Stack p={16}>
      {/* {(function () {
        if (subscriptions.isFetching || billingBankAccount.isFetching)
          return <Skeleton height={300} />;
        if (subscriptions.error || billingBankAccount.error || !billingBankAccount.data)
          return <Errored error={subscriptions.error || billingBankAccount.error} />;

        if (calculated) {
          const activatedIndex = subscriptions.data.findIndex(
            (v) => v._id === workspace.workspaceSubscription?.subscriptionId
          );
          const selectSubscriptionIndex = subscriptions.data.findIndex(
            (v) => v._id === calculated.selectedSubscription._id
          );
          const isUpgraded = selectSubscriptionIndex > activatedIndex;

          if (step === "COMPLETED") {
            return (
              <Stack p={16}>
                <Title ta="center" c={workspace.workspaceSubscription?.subscription.color} fw={340}>
                  Thành công!
                </Title>
                <Text ta="center">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ Joy One</Text>

                <Button
                  type="submit"
                  color={workspace.workspaceSubscription?.subscription.color}
                  radius={100}
                  onClick={() => modals.close("ModalWorkspaceSubscription")}
                >
                  Okay!
                </Button>
              </Stack>
            );
          }

          if (step === "PROCESSING") {
            return (
              <Stack p={16}>
                <Loading message={isUpgraded ? "Đang nâng cấp..." : "Đang thay đổi gói..."} />
              </Stack>
            );
          }

          if (step === "PAYMENT") {
            if (bankTransaction)
              return (
                <Stack gap={16}>
                  <Card withBorder p={10}>
                    <Checkout
                      tx={bankTransaction}
                      onBack={() => {
                        setBankTransaction(undefined);
                        setCalculated(undefined);
                      }}
                    />
                  </Card>
                </Stack>
              );

            return (
              <Stack p={16}>
                <Title ta="center" c="primary" fw={700}>
                  Đang xử lí giao dịch
                </Title>
                <Loading message="Vui lòng đợi trong giây lát..." />
              </Stack>
            );
          }

          return (
            <Stack>
              <SimpleGrid cols={{ md: 2 }}>
                <Card withBorder radius={25}>
                  <Stack gap={20}>
                    <Stack gap={10}>
                      <Text fz={em(13)}>{isUpgraded ? "Nâng cấp gói" : "Sử dụng gói"}</Text>
                      <Group gap={10}>
                        <Badge
                          color={workspace.workspaceSubscription?.subscription.color}
                          size="xl"
                          variant={
                            workspace.workspaceSubscription?.subscription.isDefault
                              ? "outline"
                              : "filled"
                          }
                        >
                          {workspace.workspaceSubscription?.subscription.name}
                        </Badge>
                        <ThemeIcon color="dark" variant="transparent">
                          <IconArrowRight />
                        </ThemeIcon>
                        <Badge
                          color={calculated.selectedSubscription.color}
                          size="xl"
                          variant={calculated.selectedSubscription.isDefault ? "outline" : "filled"}
                          leftSection={
                            isUpgraded ? (
                              <IconConfetti size={18} style={{ marginRight: 5 }} />
                            ) : undefined
                          }
                        >
                          {calculated.selectedSubscription.name}
                        </Badge>
                      </Group>
                    </Stack>

                    <Card withBorder radius={16}>
                      <Stack gap={10}>
                        <Text fz={em(13)}>Chi phí mỗi tháng</Text>

                        <Group justify="space-between">
                          <Text fw={500}>
                            x{num(workspace.workspaceSubscription?.stat.totalMembers)} Thành viên
                          </Text>
                          <Stack gap={0}>
                            {calculated.selectedSubscription.pricePerMemberNotSale && (
                              <Text ta="right" td="line-through" fz={em(12)} c="gray">
                                {num(
                                  calculated.selectedSubscription.pricePerMemberNotSale *
                                    (workspace.workspaceSubscription?.stat.totalMembers ?? 0)
                                )}
                              </Text>
                            )}
                            <Text ta="right" fw={800}>
                              {num(totalPrice)}
                            </Text>
                          </Stack>
                        </Group>
                      </Stack>
                    </Card>

                    <Stack gap={10}>
                      <Group justify="space-between">
                        <Text fz={em(13)}>
                          {calculated.totalPrice < 0
                            ? "Bạn sẽ được hoàn lại"
                            : calculated.totalPrice < totalPrice
                            ? "Cần thanh toán thêm"
                            : "Tổng số tiền thanh toán"}
                        </Text>
                        <Text ta="right" fz={em(15)} fw={700}>
                          {num(Math.abs(calculated.totalPrice))}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text fz={em(13)}>Ngày thanh toán tiếp theo</Text>
                        <Text ta="right" fz={em(15)} fw={700}>
                          {renderDate(calculated.nextBillingAt * 1000)}
                        </Text>
                      </Group>
                    </Stack>

                    <Button
                      type="submit"
                      color={calculated.selectedSubscription.color}
                      radius={100}
                      miw={200}
                      onClick={onPayment}
                    >
                      {totalAmount > 0 ? "Thanh toán" : "Chọn gói này"}
                    </Button>
                  </Stack>
                </Card>

                <SubscriptionCard subscription={calculated.selectedSubscription} />
              </SimpleGrid>

              <Anchor
                mt={10}
                onClick={() => setCalculated(undefined)}
                c="gray"
                ta="center"
                fz={em(12)}
                fw={500}
              >
                Chọn gói khác
              </Anchor>
            </Stack>
          );
        }

        return (
          <SimpleGrid cols={{ md: 3 }}>
            {subscriptions.data
              .filter((v) => !v.isPrivate)
              .map((subscription) => {
                const activatedIndex = subscriptions.data.findIndex(
                  (v) => v._id === workspace.workspaceSubscription?.subscriptionId
                );
                const index = subscriptions.data.findIndex((v) => v._id === subscription._id);
                const isUpgrade = index > activatedIndex;
                const isActivated =
                  workspace.workspaceSubscription?.subscriptionId === subscription._id;

                return (
                  <SubscriptionCard
                    key={subscription._id}
                    subscription={subscription}
                    onSelect={() => onCalculate(subscription._id)}
                    isUpgrade={isUpgrade}
                    isActivated={isActivated}
                  />
                );
              })}
          </SimpleGrid>
        );
      })()} */}
    </Stack>
  );
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
                {num(subscription.pricePerMember)}đ
              </Text>
              {subscription.pricePerMemberNotSale && (
                <Text fz={em(13)} c="gray" td="line-through" fw={500}>
                  {num(subscription.pricePerMemberNotSale)}đ
                </Text>
              )}
            </Group>
            <Text fz={em(12)} c="gray">
              {t("members")} / {t("month")}
            </Text>
          </Stack>

          <Stack gap={16} mt={20}>
            <Group gap={16} justify="space-between" wrap="nowrap">
              <Text fz={em(15)} fw={400}>
                {t("max_members")}
              </Text>
              <Text fz={em(15)} fw={700}>
                {renderSubscriptionNum(subscription.limitMembers)}
              </Text>
            </Group>
            <Group gap={16} justify="space-between" wrap="nowrap">
              <Text fz={em(15)} fw={400}>
                {t("limit_storage")}
              </Text>
              <Text fz={em(15)} fw={700}>
                {renderSubscriptionNum(subscription.limitStorage, (v) => formatBytes(v))}
              </Text>
            </Group>
            <Group gap={16} justify="space-between" wrap="nowrap">
              <Text fz={em(15)} fw={400}>
                {t("connect")} Facebook Pages / Zalo OAs
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
                {t("using_this_subscription")}
              </Button>
            ) : (
              <Button
                mt={30}
                color={subscription.color}
                type="submit"
                radius={100}
                onClick={() => props.onSelect?.(subscription._id)}
              >
                {props.isUpgrade ? t("upgrade") : t("select_this_subscription")}
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
    title: <ModalTitle title={t("register_subscription")} icon={IconBox} />,
    children: <ModalWorkspaceSubscription />,
    size: "auto",
    fullScreen: getView() === "mobile",
  });
};
