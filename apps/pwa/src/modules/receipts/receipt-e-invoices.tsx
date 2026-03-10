"use client";

import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { Empty } from "@/components/empty";
import { DateFormat } from "@/components/format/date-format";
import { EventType } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { ResponseList } from "@/types";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge, Card, Center, Group, Image, Skeleton, Stack, Text } from "@mantine/core";
import { IconArchive, IconEye, IconFileInvoice } from "@tabler/icons-react";
import { useMemo, type FC } from "react";
import { apiClient } from "../apis";
import { useRestQuery } from "../apis/use-rest-query";
import { PluginEInvoicesEntity } from "../plugins/e-invoices/plugin-e-invoices.entities";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { ReceiptDataFragment } from "./graphql/fragmentReceipt.graphql";

interface ReceiptEInvoicesProps {
  receipt: Pick<ReceiptDataFragment, "id" | "status">;
}

export const ReceiptEInvoices: FC<ReceiptEInvoicesProps> = ({ receipt }) => {
  const workspace = useWorkspace();

  const { data, isLoading, refetch } = useRestQuery<ResponseList<PluginEInvoicesEntity>>({
    route: `/plugins/e-invoices`,
    params: {
      receiptId: receipt.id,
    },
    refetchEvents: [EventType.EInvoiceCreated, EventType.EInvoiceRemoved, EventType.ReceiptPaid],
  });

  const handleArchiveEInvoice = (invoice: PluginEInvoicesEntity) => {
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
        await apiClient.delete(`/plugins/e-invoices/${invoice._id}/cancel`);
        await refetch();
      },
      cancelLabel: <Trans>Keep</Trans>,
      inverse: true,
    });
  };

  const isCanExportEInvoice = useMemo(() => {
    return !isLoading && workspace.hasPermission(WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE);
  }, [isLoading, workspace.hasPermission(WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE)]);

  const cta = useMemo(() => {
    return (
      <Center>
        <Button
          mt={16}
          size="xs"
          leftIcon={IconFileInvoice}
          onClick={() => apiClient.post(`/plugins/e-invoices`, { receiptId: receipt.id })}
        >
          {t`Export E-Invoice`}
        </Button>
      </Center>
    );
  }, [receipt.status]);

  if (!isCanExportEInvoice) return null;

  return (
    <Stack gap={8}>
      <Text fw={600} fz={14}>
        {t`E-Invoices`}
      </Text>

      {isLoading && <Skeleton height={100} />}

      {data?.data.map((invoice) => {
        return (
          <Card withBorder shadow="none" key={invoice._id}>
            <Group justify="space-between">
              <Group wrap="nowrap">
                <Image src={invoice.provider.logo} h={40} w={80} fit="contain" />
                <Stack gap={6}>
                  <Text fz={14} fw={600}>
                    {invoice.provider.name}
                  </Text>

                  <CopyText text={invoice.invoiceId} fz={14} truncate maw={200}>
                    ID: {String.limitCharacters(invoice.invoiceId, 10)}
                  </CopyText>

                  <Text fz={12} truncate maw={200}>
                    <DateFormat value={invoice.createdAt} type="date-time" />
                  </Text>
                </Stack>
              </Group>

              {invoice.isCancelled ? (
                <Badge color="red" variant="light">
                  {t`Cancelled`}
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
                    {t`Cancel`}
                  </Button>

                  <Button
                    size="xs"
                    leftIcon={IconEye}
                    variant="light"
                    onClick={() => window.open(invoice.url, "_blank")}
                  >
                    {t`View Invoice`}
                  </Button>
                </Group>
              )}
            </Group>
          </Card>
        );
      })}

      {data?.count === 0 ? <Empty>{cta}</Empty> : cta}
    </Stack>
  );
};
