"use client";

import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { EventType, ReceiptStatus } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad, onArchive } from "@/utils/actions";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Badge, Center, Group, Skeleton, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconArchive, IconEdit, IconRefresh, IconReload } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC } from "react";
import { ReceiptEInvoices } from "./receipt-e-invoices";

import { UpdateReceiptInput } from "@/graphql/types.graphql";
import MUTATION_ARCHIVE_RECEIPT from "@/modules/receipts/graphql/mutationArchiveReceipt.graphql";
import MUTATION_REVERT_PAYMENT_RECEIPT from "@/modules/receipts/graphql/mutationRevertPaymentReceipt.graphql";
import MUTATION_UPDATE_RECEIPT from "@/modules/receipts/graphql/mutationUpdateReceipt.graphql";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEventsListener } from "../events/event-service";
import QUERY_RECEIPT from "./graphql/queryReceipt.graphql";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const ReceiptDetail: FC<{
  receiptId: string;
  p?: number;
}> = ({ receiptId, p }) => {
  const workspace = useWorkspace();

  const {
    data: receiptData,
    refetch: refetchReceipt,
    loading: isLoadingReceipt,
    error: errorReceipt,
  } = useQuery(QUERY_RECEIPT, {
    variables: {
      id: receiptId,
    },
  });

  useEventsListener(
    [
      EventType.ReceiptPaid,
      EventType.ReceiptDisbursement,
      EventType.ReceiptArchived,
      EventType.ReceiptUpdated,
      EventType.ReceiptChangeWorkspaceBranch,
      EventType.ReceiptRevertPayment,
    ],
    (event) => {
      if (
        event.ref === receiptId ||
        (event.relatedEntities && event.relatedEntities.some((v) => v.id === receiptId))
      ) {
        refetchReceipt();
      }
    }
  );

  const receipt = receiptData?.receipt;

  const [updateReceipt] = useMutation(MUTATION_UPDATE_RECEIPT);
  const [archiveReceipt] = useMutation(MUTATION_ARCHIVE_RECEIPT);
  const [revertPaymentReceipt] = useMutation(MUTATION_REVERT_PAYMENT_RECEIPT);

  const onUpdate = async (input: UpdateReceiptInput) => {
    if (!receipt) return;
    onActionLoad({
      name: <Trans>Update receipt</Trans>,
      icon: IconEdit,
      process: async () => {
        if (!receipt) return;
        await updateReceipt({
          variables: {
            updateReceiptId: receipt.id,
            input: input,
          },
        });
        refetchReceipt();
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
        await revertPaymentReceipt({
          variables: {
            revertPaymentReceiptId: receipt.id,
          },
        });
        await refetchReceipt();
      },
      inverse: true,
    });
  };

  if (isLoadingReceipt)
    return (
      <Stack p={p}>
        <Skeleton height={200} />
      </Stack>
    );

  if (errorReceipt || !receipt) return <Errored error={errorReceipt} />;

  return (
    <Stack gap={30} p={p}>
      <Stack gap={20}>
        {receipt.isArchived && (
          <Center>
            <Badge size="lg" color="red">
              <Trans>Archived</Trans>
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
        {receipt.status === ReceiptStatus.Paid &&
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
                  await archiveReceipt({
                    variables: {
                      archiveReceiptId: receipt.id,
                    },
                  });
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
