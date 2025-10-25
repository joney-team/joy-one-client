"use client";

import { Button } from "@/components/buttons/button";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconFileInvoice } from "@tabler/icons-react";
import { type FC } from "react";
import { useQuery } from "../apis/use-query";
import { EventType } from "../events/event-types";
import { PluginEInvoicesEntity } from "../plugins/e-invoices/plugin-e-invoices.entities";
import { PluginEInvoicesProviderInformations } from "../plugins/e-invoices/plugin-e-invoices.types";
import { OnReceiptDetailModal } from "../receipts/modals/modal-receipt-detail";

export const EInvoiceList: FC = () => {
  const providerConfigs = useQuery<PluginEInvoicesProviderInformations>({
    route: "/plugins/e-invoices/providers/informations",
    networkMode: "offlineFirst",
  });

  return (
    <Stack p={16}>
      <List<PluginEInvoicesEntity>
        id="eis"
        name="eInvoices"
        limit={18}
        icon={IconFileInvoice}
        route="/plugins/e-invoices"
        columns={{
          receiptCode: CodeColumn({
            w: 200,
            name: "receipt_code",
            onClick: (_, data) => OnReceiptDetailModal({ id: data.receiptId }),
          }),
          createdAt: DateTimeColumn({ name: "createdAt", sortable: true, isHasFilter: true }),
          provider: EnumColumn({
            w: 200,
            name: "provider",
            valuePath: "provider.provider",
            options: Object.entries(providerConfigs.data ?? {}).map(([provider, info]) => ({
              label: info.name,
              value: provider,
            })),
          }),
          url: {
            name: "invoice",
            render: ({ data }) => (
              <Button onClick={() => window.open(data.url, "_blank")}>
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
