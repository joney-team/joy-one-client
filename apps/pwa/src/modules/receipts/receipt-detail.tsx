"use client";

import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { EventList } from "@/components/event-list";
import { ModalTitle } from "@/components/modal-title";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { archiveReceipt, getReceipt, updateReceipt } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptStatus, UpdateReceiptDto } from "@/modules/receipts/receipts-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onActionLoad, onArchive } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { Badge, Center, Group, Skeleton, Stack } from "@mantine/core";
import { modals, openConfirmModal } from "@mantine/modals";
import { IconArchive, IconRefresh, IconReload } from "@tabler/icons-react";
import { FC } from "react";
import { api } from "../apis";
import { ReceiptEInvoices } from "./receipt-e-invoices";

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
        EventType.RECEIPT_PAID,
        EventType.RECEIPT_DISBURSEMENT,
        EventType.RECEIPT_ARCHIVED,
        EventType.RECEIPT_UPDATED,
        EventType.RECEIPT_CHANGE_WORKSPACE_BRANCH,
        EventType.RECEIPT_REVERT_PAYMENT,
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
      process: async () => {
        if (!detail.data) return;
        await updateReceipt(detail.data.id, dto);
      },
    });
  };

  const onRevertPayment = async () => {
    if (!receipt) return;

    openConfirmModal({
      title: <ModalTitle color="red" title={t("confirmation")} icon={IconRefresh} />,
      children: t("event_type_" + EventType.RECEIPT_REVERT_PAYMENT),
      color: "red",
      onConfirm: () =>
        onActionLoad({
          name: t("event_type_" + EventType.RECEIPT_REVERT_PAYMENT),
          process: async () => {
            await api.post(`/receipts/${receipt.id}/revert-payment`);
            await detail.fetch();
          },
        }),
      labels: { confirm: t("confirm"), cancel: t("cancel") },
      confirmProps: { color: "red" },
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
              {t("archived_entity", { entity: t("receipt") })}
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

      <EventList ref={receipt.id} />

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
              {t("revert_payment")}
            </Button>
          )}

        {!receipt.isArchived && workspace.hasPermission(WorkspacePermission.RECEIPTS_ARCHIVE) && (
          <Button
            fw={400}
            variant="light"
            color="gray"
            onClick={() =>
              onArchive({
                process: () => archiveReceipt(receipt.id),
                onArchived: () => {
                  modals.closeAll();
                },
              })
            }
            leftIcon={IconArchive}
            size="compact-sm"
          >
            {t("archive")}
          </Button>
        )}
      </Group>
    </Stack>
  );
};
