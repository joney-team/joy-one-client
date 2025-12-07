"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { SectionTitle } from "@/components/session-title";
import { useLayout } from "@/layout/layout-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";
import { useGradient } from "@/modules/theme/use-color";
import { OnModalWorkspaceBillingDeposit } from "@/modules/workspace-billings/modals/modal-workspace-billing-deposit";
import { calculateWorkspaceSubscriptionBillings } from "@/modules/workspace-subscriptions/workspace-subscriptions-service";
import { CalculateWorkspaceSubscriptionBillingResponse } from "@/modules/workspace-subscriptions/workspace-subscriptions-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  em,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArrowBigDown,
  IconArrowDown,
  IconCashRegister,
  IconReceipt,
  IconReportMoney,
} from "@tabler/icons-react";
import { type FC, useEffect, useState } from "react";
import { workspaceBillingStatuses, workspaceBillingTypes } from "./workspace-billings-contants";
import { getWorkspaceBillings } from "./workspace-billings-service";
import { WorkspaceBillingStatus } from "./workspace-billings-types";

export const WorkspaceBillingList: FC = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const gradient = useGradient();

  const [subscriptionCalculated, setSubscriptionCalculated] =
    useState<CalculateWorkspaceSubscriptionBillingResponse | null>(null);

  const billings = useList({
    id: "billings",
    fetch: (q) => getWorkspaceBillings(q),
  });

  const fetchSubscriptionCalculated = async (workspaceId: string) => {
    await calculateWorkspaceSubscriptionBillings({ workspaceId })
      .then(setSubscriptionCalculated)
      .catch(console.error);
  };

  useEffect(() => {
    layout.setComponents({
      head: t`Subscription / billings`,
      navigation: (
        <Button
          radius={100}
          leftIcon={IconArrowDown}
          onClick={() => OnModalWorkspaceBillingDeposit()}
        >
          {t`Deposit`}
        </Button>
      ),
    });
  }, []);

  useEffect(() => {
    if (workspace.userMember.workspaceId) {
      fetchSubscriptionCalculated(workspace.userMember.workspaceId);
    }
  }, [workspace.userMember.workspaceId]);

  useEventsListener(
    [
      EventType.BankTransactionCancelled,
      EventType.BankTransactionFailed,
      EventType.BankTransactionPaid,
      EventType.BankTransactionFulfilled,

      EventType.WorkspaceBillingsDeposited,
      EventType.WorkspaceBillingsWithdrawn,
      EventType.WorkspaceBillingsPaymentNew,
      EventType.WorkspaceBillingsCashbackNew,
      EventType.WorkspaceBillingsPaymentPaid,
    ],
    () => {
      billings.fetch(true, { isSilient: true });
    },
    [workspace.userMember.workspaceId]
  );

  return (
    <Container p={16}>
      <Stack gap={30}>
        <SimpleGrid cols={2}>
          <Card
            style={{
              background: gradient(),
              cursor: "pointer",
            }}
            flex={1}
            p={10}
            shadow="xs"
          >
            <Group justify="space-between" wrap="nowrap">
              <Group>
                <IconCashRegister size={40} strokeWidth={0.9} color="white" />
                <Stack gap={0}>
                  <Text c="white" fz={12} fw={300}>
                    <Trans>Balance</Trans>
                  </Text>
                  <Text c="white" fw={700} fz={16}>
                    <NumberFormat value={billings.report?.balance || 0} />
                  </Text>
                </Stack>
              </Group>

              <ActionIcon
                variant="transparent"
                color="white"
                onClick={() => OnModalWorkspaceBillingDeposit()}
              >
                <IconArrowBigDown strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          </Card>

          <Card flex={1} p={10} shadow="xs">
            <Group justify="space-between" wrap="nowrap">
              <Group>
                <IconReceipt size={40} strokeWidth={0.9} />
                <Stack gap={0}>
                  <Text c="dark" fz={12} fw={300}>
                    <Trans>Pending payment</Trans>
                  </Text>
                  <Text
                    c={(billings.report?.pendingPayment || 0) !== 0 ? "orange" : "dark"}
                    fw={700}
                    fz={16}
                  >
                    <NumberFormat value={Math.abs(billings.report?.pendingPayment || 0)} />
                  </Text>
                </Stack>
              </Group>
            </Group>
          </Card>
        </SimpleGrid>

        <Stack gap={10}>
          <SectionTitle name={t`Billings`} icon={IconReportMoney} />

          {billings.isHasData && (
            <SimpleGrid cols={{ md: 1 }}>
              {billings.data.map((billing) => {
                return (
                  <Card key={billing._id} shadow="xs" padding="md">
                    <Group gap={10} justify="space-between">
                      <Stack gap={5}>
                        <Text fw={500} fz={em(12)} c="gray">
                          <DateFormat value={billing.createdAt} type="date" />
                        </Text>
                        <Group gap={8}>
                          <Text>{workspaceBillingTypes[billing.type].label()}</Text>
                          {billing.status !== WorkspaceBillingStatus.PAID && (
                            <Badge size="xs" ta="right" color={"orange"}>
                              {workspaceBillingStatuses[billing.status].label()}
                            </Badge>
                          )}
                        </Group>
                      </Stack>

                      <Stack justify="end" miw={100} gap={3}>
                        <Text fw={700} ta="right" c={workspaceBillingTypes[billing.type].color}>
                          {billing.amount > 0 ? "+" : ""}
                          <NumberFormat value={billing.amount} />
                        </Text>

                        <Text fz={em(10)} ta="right" c="gray">
                          {t`Balance at billing time`}: <NumberFormat value={billing.balance} />
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}

          {billings.isFetching && <Skeleton height={200} />}
          <Errored visible={billings.isHasError} error={billings.error} />
          <Empty visible={billings.isEmpty} />
        </Stack>
      </Stack>
    </Container>
  );
};
