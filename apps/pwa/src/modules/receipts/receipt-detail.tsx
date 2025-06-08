"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Errored } from "@/components/errored";
import { EventList } from "@/components/event-list";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { onActionLoad } from "@/utils/actions";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { archiveReceipt, getReceipt, updateReceipt } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, UpdateReceiptDto } from "@/modules/receipts/receipts-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { Badge, Center, Skeleton, Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { FC } from "react";
import { AppEntity } from "@/types";

export const ReceiptDetail: FC<{
  id?: string;
  onLoaded?: (receipt: ReceiptEntity) => void;
  p?: number;
}> = ({ id, onLoaded, p }) => {
  const params = useParams();
  const receiptId = id || (params.id as string);
  const workspace = useWorkspace();

  const detail = useFetch<ReceiptEntity>({
    id: `receipts-${receiptId}`,
    fetch: async () => {
      const receipt = await getReceipt(receiptId);
      onLoaded?.(receipt);
      return receipt;
    },
    events: {
      types: [
        EventType.RECEIPT_PAID,
        EventType.RECEIPT_DISBURSEMENT,
        EventType.RECEIPT_ARCHIVED,
        EventType.RECEIPT_UPDATED,
        EventType.RECEIPT_CHANGE_WORKSPACE_BRANCH,
      ],
      condition: (e, _receipt) =>
        e.ref === _receipt.id ||
        (!!e.relatedEntities && e.relatedEntities.some((v) => v.entity === AppEntity.RECEIPTS && v.id === _receipt.id)),
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

  if (detail.isFetching)
    return (
      <Stack p={p}>
        <Skeleton height={200} />
      </Stack>
    );

  if (detail.error || !receipt) return <Errored error={detail.error} />;

  return (
    <Stack gap={30} p={p}>
      <Stack gap={10}>
        {receipt.isArchived && (
          <Center>
            <Badge size="lg" color="red">
              {t("archived_entity", { entity: t("receipt") })}
            </Badge>
          </Center>
        )}

        <ReceiptCard receipt={receipt} onUpdate={onUpdate} isShowPrint isShowImage />
      </Stack>

      <EventList ref={receipt.id} />

      <ButtonArchive
        name="receipt"
        enabled={!receipt.isArchived && workspace.hasPermission(WorkspacePermission.RECEIPTS_ARCHIVE)}
        process={() => archiveReceipt(receipt.id)}
      />
    </Stack>
  );
};
