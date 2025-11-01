"use client";

import { Button } from "@/components/buttons/button";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconEye, IconFileInvoice } from "@tabler/icons-react";
import { type FC } from "react";
import { useQuery } from "../apis/use-query";
import { EventType } from "../events/event-types";
import { PluginEInvoicesEntity } from "../plugins/e-invoices/plugin-e-invoices.entities";
import { PluginEInvoicesProviderInformations } from "../plugins/e-invoices/plugin-e-invoices.types";
import { OnReceiptDetailModal } from "../receipts/modals/modal-receipt-detail";
import { t } from "@lingui/core/macro";

export const EInvoiceList: FC = () => {
  const providerConfigs = useQuery<PluginEInvoicesProviderInformations>({
    route: "/plugins/e-invoices/providers/informations",
    networkMode: "offlineFirst",
  });

  return (
    <Stack p={16}>
      <List<PluginEInvoicesEntity>
        id="eis"
        name={t`E-Invoices`}
        limit={18}
        icon={IconFileInvoice}
        route="/plugins/e-invoices"
        columns={{
          receiptCode: codeColumn({
            defaultWidth: 200,
            name: t`Receipt code`,
            onClick: (_, data) => OnReceiptDetailModal({ id: data.receiptId }),
          }),
          createdAt: dateTimeColumn({
            name: t`Created at`,
            sortable: true,
            isHasFilter: true,
          }),
          provider: enumColumn({
            defaultWidth: 400,
            name: t`Provider`,
            valuePath: "provider.provider",
            options: Object.entries(providerConfigs.data ?? {}).map(([provider, info]) => ({
              label: info.name,
              value: provider,
            })),
          }),
          url: {
            name: t`Invoice`,
            defaultWidth: 200,
            render: ({ data }) => (
              <Button
                onClick={() => window.open(data.url, "_blank")}
                variant="light"
                leftIcon={IconEye}
                size="xs"
              >
                <Trans>View E-Invoice</Trans>
              </Button>
            ),
          },
        }}
        events={[
          EventType.RECEIPT_NEW,
          EventType.RECEIPT_PAID,
          EventType.RECEIPT_UPDATED,
          EventType.RECEIPT_DISBURSEMENT,
          EventType.RECEIPT_ARCHIVED,
          EventType.RECEIPT_UNARCHIVED,
          EventType.RECEIPT_REVERT_PAYMENT,
        ]}
      />
    </Stack>
  );
};
