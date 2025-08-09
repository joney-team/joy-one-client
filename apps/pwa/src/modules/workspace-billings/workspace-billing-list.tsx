import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { SessionTitle } from "@/components/session-title";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { num, renderDateTime, t } from "@/modules/lang/lang-service";
import { useColor, useGradient } from "@/modules/theme/use-color";
import { OnModalWorkspaceBillingDeposit } from "@/modules/workspace-billings/modals/modal-workspace-billing-deposit";
import { calculateWorkspaceSubscriptionBillings } from "@/modules/workspace-subscriptions/workspace-subscriptions-service";
import { CalculateWorkspaceSubscriptionBillingResponse } from "@/modules/workspace-subscriptions/workspace-subscriptions-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useList } from "@/utils/use-list.util";
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
import {
  getWorkspaceBillings,
  getWorkspaceBillingStatusLabel,
  getWorkspaceBillingTypeColor,
  getWorkspaceBillingTypeLabel,
} from "./workspace-billings-service";
import { WorkspaceBillingStatus } from "./workspace-billings-types";

export const WorkspaceBillingList: FC = () => {
  const workspace = useWorkspace();
  const router = useRouter();
  const layout = useLayout();
  const color = useColor();
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
      head: t("ws_sub_billings"),
      navigation: (
        <Button
          radius={100}
          leftIcon={IconArrowDown}
          onClick={() => OnModalWorkspaceBillingDeposit()}
        >
          {t("deposit")}
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
      EventType.BANK_TRANSACTION_CANCELLED,
      EventType.BANK_TRANSACTION_FAILED,
      EventType.BANK_TRANSACTION_PAID,
      EventType.BANK_TRANSACTION_FULFILLED,

      EventType.WORKSPACE_BILLINGS_DEPOSITED,
      EventType.WORKSPACE_BILLINGS_WITHDRAWN,
      EventType.WORKSPACE_BILLINGS_PAYMENT_NEW,
      EventType.WORKSPACE_BILLINGS_CASHBACK_NEW,
      EventType.WORKSPACE_BILLINGS_PAYMENT_PAID,
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
                    {t("balance")}
                  </Text>
                  <Text c="white" fw={700} fz={16}>
                    {num(billings.report?.balance || 0)}
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
                    {t("pendingPayment")}
                  </Text>
                  <Text
                    c={(billings.report?.pendingPayment || 0) !== 0 ? "orange" : "dark"}
                    fw={700}
                    fz={16}
                  >
                    {num(Math.abs(billings.report?.pendingPayment || 0))}
                  </Text>
                </Stack>
              </Group>
            </Group>
          </Card>
        </SimpleGrid>

        <Stack gap={10}>
          <SessionTitle name={t("ws_billings")} icon={IconReportMoney} />

          {billings.isHasData && (
            <SimpleGrid cols={{ md: 1 }}>
              {billings.data.map((billing) => {
                return (
                  <Card key={billing._id} shadow="xs" padding="md">
                    <Group gap={10} justify="space-between">
                      <Stack gap={5}>
                        <Text fw={500} fz={em(12)} c="gray">
                          {renderDateTime(billing.createdAt, true)}
                        </Text>
                        <Group gap={8}>
                          <Text>{getWorkspaceBillingTypeLabel(billing.type)}</Text>
                          {billing.status !== WorkspaceBillingStatus.PAID && (
                            <Badge size="xs" ta="right" color={"orange"}>
                              {getWorkspaceBillingStatusLabel(billing.status)}
                            </Badge>
                          )}
                        </Group>
                      </Stack>

                      <Stack justify="end" miw={100} gap={3}>
                        <Text fw={700} ta="right" c={getWorkspaceBillingTypeColor(billing.type)}>
                          {billing.amount > 0 ? "+" : ""}
                          {num(billing.amount)}
                        </Text>

                        <Text fz={em(10)} ta="right" c="gray">
                          {t("balance_at_billing_time")}: {num(billing.balance)}
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
