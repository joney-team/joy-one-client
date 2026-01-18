"use client";

import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { EventType } from "@/graphql/enums.graphql";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { archiveReceipt, getReceipt, updateReceipt } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptStatus, UpdateReceiptDto } from "@/modules/receipts/receipts-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onActionLoad, onArchive } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge, Center, Group, Skeleton, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconArchive, IconEdit, IconRefresh, IconReload } from "@tabler/icons-react";
import { FC } from "react";
import { api } from "../apis";
import { ReceiptEInvoices } from "./receipt-e-invoices";
import dynamic from "next/dynamic";
import { nonLoading } from "@/utils/non-loading";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const ReceiptDetail: FC<{
  receiptId: string;
  onLoaded?: (receipt: ReceiptEntity) => void;
  p?: number;
}> = ({ receiptId, onLoaded, p }) => {
  const workspace = useWorkspace();

  const detail = useFetch<ReceiptEntity>({
    id: `receipts-${receiptId}`,
    fetch: async () => {
      const receipt = await getReceipt(receiptId);
      onLoaded?.(receipt);
      return receipt;
    },
    refetchEvents: {
      types: [
        EventType.ReceiptPaid,
        EventType.ReceiptDisbursement,
        EventType.ReceiptArchived,
        EventType.ReceiptUpdated,
        EventType.ReceiptChangeWorkspaceBranch,
        EventType.ReceiptRevertPayment,
      ],
      condition: (e, _receipt) =>
        e.ref === _receipt.id ||
        (!!e.relatedEntities &&
          e.relatedEntities.some((v) => v.entity === AppEntity.RECEIPTS && v.id === _receipt.id)),
    },
  });

  const { data: receipt } = detail;

  const onUpdate = async (dto: UpdateReceiptDto) => {
    if (!detail.data) return;
    detail.setData({ ...detail.data, ...dto });
    onActionLoad({
      name: <Trans>Update receipt</Trans>,
      icon: IconEdit,
      process: async () => {
        if (!detail.data) return;
        await updateReceipt(detail.data.id, dto);
      },
    });
  };

  const onRevertPayment = async () => {
    if (!receipt) return;

    onConfirmModal({
      title: <Trans>Revert Payment</Trans>,
      content: <Trans>Are you sure you want to revert the payment?</Trans>,
      type: "danger",
      icon: IconRefresh,
      confirmLabel: <Trans>Revert Payment</Trans>,
      onConfirm: async () => {
        await api.post(`/receipts/${receipt.id}/revert-payment`);
        await detail.fetch();
      },
      inverse: true,
    });
  };

  if (detail.isFetching)
    return (
      <Stack p={p}>
        <Skeleton height={200} />
      </Stack>
    );

  if (detail.error || !receipt) return <Errored error={detail.error} />;

  return (
    <Stack gap={30} p={p}>
      <Stack gap={20}>
        {receipt.isArchived && (
          <Center>
            <Badge size="lg" color="red">
              {t`Archived`}
            </Badge>
          </Center>
        )}

        <ReceiptCard
          receipt={receipt}
          onUpdate={onUpdate}
          isShowPrint
          isShowImage
          isOpenModal={false}
        />

        <ReceiptEInvoices receipt={receipt} />
      </Stack>

      <EventsList ref={receipt.id} />

      <Group justify="center" gap={8}>
        {receipt.status === ReceiptStatus.PAID &&
          workspace.hasPermission(WorkspacePermission.RECEIPTS_REVERT_PAYMENT) && (
            <Button
              fw={400}
              variant="light"
              color="gray"
              onClick={onRevertPayment}
              leftIcon={IconReload}
              size="compact-sm"
            >
              <Trans>Revert Payment</Trans>
            </Button>
          )}

        {!receipt.isArchived && workspace.hasPermission(WorkspacePermission.RECEIPTS_ARCHIVE) && (
          <Button
            fw={400}
            variant="light"
            color="gray"
            onClick={() =>
              onArchive({
                name: <Trans>Receipt</Trans>,
                process: async () => {
                  await archiveReceipt(receipt.id);
                  modals.closeAll();
                },
              })
            }
            leftIcon={IconArchive}
            size="compact-sm"
          >
            <Trans>Archive</Trans>
          </Button>
        )}
      </Group>
    </Stack>
  );
};
