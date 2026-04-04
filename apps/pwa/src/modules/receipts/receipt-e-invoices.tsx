"use client";

import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { Empty } from "@/components/empty";
import { DateFormat } from "@/components/format/date-format";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { EventType } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { String } from "@/utils/string.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Badge, Card, Center, Group, Image, Skeleton, Stack, Text } from "@mantine/core";
import { IconArchive, IconEye, IconFileInvoice } from "@tabler/icons-react";
import { useMemo, type FC } from "react";
import CancelEInvoiceDocument from "../plugins/e-invoices/graphql/cancelEInvoice.graphql";
import CreateEInvoiceDocument from "../plugins/e-invoices/graphql/createEInvoice.graphql";
import { EInvoiceFragment } from "../plugins/e-invoices/graphql/fragmentEInvoice.graphql";
import GetEInvoicesDocument from "../plugins/e-invoices/graphql/getEInvoices.graphql";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { ReceiptFragment } from "./graphql/fragmentReceipt.graphql";

interface ReceiptEInvoicesProps {
  receipt: Pick<ReceiptFragment, "id" | "status">;
}

export const ReceiptEInvoices: FC<ReceiptEInvoicesProps> = ({ receipt }) => {
  const workspace = useWorkspace();
  const client = useApolloClient();

  const { data, isFetching, refetch, isInitialized, count } = useGraphqlList<EInvoiceFragment>({
    query: GetEInvoicesDocument,
    params: {
      receiptId: receipt.id,
    },
    events: [EventType.EInvoiceCreated, EventType.EInvoiceRemoved, EventType.ReceiptPaid],
  });

  const handleArchiveEInvoice = (invoice: EInvoiceFragment) => {
    onConfirmModal({
      title: <Trans>Cancel E-Invoice</Trans>,
      type: "danger",
      content: (
        <Trans>
          Are you sure you want to cancel the e-invoice? This action cannot be undone. The e-invoice
          will be deleted.
        </Trans>
      ),
      onConfirm: async () => {
        await client.mutate({
          mutation: CancelEInvoiceDocument,
          variables: {
            invoiceId: invoice._id,
          },
        });
        await refetch();
      },
      cancelLabel: <Trans>Keep</Trans>,
      inverse: true,
    });
  };

  const isCanExportEInvoice = useMemo(() => {
    return !isFetching && workspace.hasPermission(WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE);
  }, [isFetching, workspace.hasPermission(WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE)]);

  const cta = useMemo(() => {
    return (
      <Center>
        <Button
          mt={16}
          size="xs"
          leftIcon={IconFileInvoice}
          onClick={() =>
            client.mutate({
              mutation: CreateEInvoiceDocument,
              variables: {
                input: {
                  receiptId: receipt.id,
                },
              },
            })
          }
        >
          <Trans>Export E-Invoice</Trans>
        </Button>
      </Center>
    );
  }, [receipt.status]);

  if (!isCanExportEInvoice) return null;

  return (
    <Stack gap={8}>
      <Text fw={600} fz={14}>
        <Trans>E-Invoices</Trans>
      </Text>

      {!isInitialized && <Skeleton height={100} />}

      {data.map((invoice) => {
        return (
          <Card withBorder shadow="none" key={invoice._id}>
            <Group justify="space-between">
              <Group wrap="nowrap">
                <Image src={invoice.providerInformation.logo} h={40} w={80} fit="contain" />
                <Stack gap={6}>
                  <Text fz={14} fw={600}>
                    {invoice.providerInformation.name}
                  </Text>

                  <CopyText text={invoice.invoiceId} fz={14} truncate maw={200}>
                    ID: {String.limitCharacters(invoice.invoiceId, 10)}
                  </CopyText>

                  {invoice.createdAt && (
                    <Text fz={12} truncate maw={200}>
                      <DateFormat value={invoice.createdAt} type="date-time" />
                    </Text>
                  )}
                </Stack>
              </Group>

              {invoice.isCancelled ? (
                <Badge color="red" variant="light">
                  <Trans>Cancelled</Trans>
                </Badge>
              ) : (
                <Group>
                  <Button
                    size="xs"
                    color="gray"
                    variant="light"
                    leftIcon={IconArchive}
                    onClick={() => handleArchiveEInvoice(invoice)}
                  >
                    <Trans>Cancel</Trans>
                  </Button>

                  <Button
                    size="xs"
                    leftIcon={IconEye}
                    variant="light"
                    onClick={() => window.open(invoice.url ?? "#", "_blank")}
                  >
                    <Trans>View Invoice</Trans>
                  </Button>
                </Group>
              )}
            </Group>
          </Card>
        );
      })}

      {count === 0 ? <Empty>{cta}</Empty> : cta}
    </Stack>
  );
};
