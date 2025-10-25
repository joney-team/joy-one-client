import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { Empty } from "@/components/empty";
import { ModalTitle } from "@/components/modal-title";
import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { Badge, Card, Center, Group, Image, Skeleton, Stack, Text } from "@mantine/core";
import { modals, openConfirmModal } from "@mantine/modals";
import { IconArchive, IconEye, IconFileInvoice } from "@tabler/icons-react";
import { useMemo, type FC } from "react";
import { api } from "../apis";
import { useQuery } from "../apis/use-query";
import { EventType } from "../events/event-types";
import { renderDateTime } from "../lang/lang-service";
import { PluginEInvoicesEntity } from "../plugins/e-invoices/plugin-e-invoices.entities";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { ReceiptEntity, ReceiptStatus } from "./receipts-types";

interface ReceiptEInvoicesProps {
  receipt: Pick<ReceiptEntity, "id" | "status">;
}

export const ReceiptEInvoices: FC<ReceiptEInvoicesProps> = ({ receipt }) => {
  const workspace = useWorkspace();

  const { data, isLoading, refetch } = useQuery<ResponseList<PluginEInvoicesEntity>>({
    route: `/plugins/e-invoices`,
    params: {
      receiptId: receipt.id,
    },
    refetchEvents: [EventType.E_INVOICE_CREATED, EventType.E_INVOICE_REMOVED],
  });

  const onArchive = (invoice: PluginEInvoicesEntity) => {
    openConfirmModal({
      modalId: `cancel-e-invoice-${invoice._id}`,
      title: <ModalTitle title={t`Cancel E-Invoice`} color="red" icon={IconArchive} />,
      children: t`Are you sure you want to cancel the e-invoice? This action cannot be undone. The e-invoice will be deleted.`,
      color: "red",
      onConfirm: () => {
        modals.close(`cancel-e-invoice-${invoice._id}`);
        onActionLoad({
          process: () => api.delete(`/plugins/e-invoices/${invoice._id}/cancel`),
          onFinished: () => {
            refetch();
          },
        });
      },
      labels: { confirm: t`Confirm Cancel`, cancel: t`Keep` },
      confirmProps: { color: "red" },
    });
  };

  const cta = useMemo(() => {
    if (!isLoading || !workspace.hasPermission(WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE))
      return null;

    return (
      <Center>
        <Button
          mt={16}
          size="xs"
          leftIcon={IconFileInvoice}
          disabled={receipt.status !== ReceiptStatus.PAID}
          onClick={() => api.post(`/plugins/e-invoices`, { receiptId: receipt.id })}
        >
          {t`Export E-Invoice`}
        </Button>
      </Center>
    );
  }, [receipt.status]);

  if (!workspace.hasPermission(WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE)) return null;

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

                  <Text fz={12} truncate maw={200}>
                    {renderDateTime(invoice.createdAt)}
                  </Text>

                  <CopyText text={invoice.invoiceId} fz={14} truncate maw={200}>
                    ID: {String.limitCharacters(invoice.invoiceId, 10)}
                  </CopyText>
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
                    onClick={() => onArchive(invoice)}
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
