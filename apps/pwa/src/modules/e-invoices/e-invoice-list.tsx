import { Button } from "@/components/buttons/button";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { Stack } from "@mantine/core";
import { IconFileInvoice } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { PluginEInvoicesEntity } from "../plugins/e-invoices/plugin-e-invoices.entities";
import { OnReceiptDetailModal } from "../receipts/modals/modal-receipt-detail";
import { tl } from "../lang/lang-service";
import { useQuery } from "../apis/use-query";
import { PluginEInvoicesProviderInformations } from "../plugins/e-invoices/plugin-e-invoices.types";
import { EnumColumn } from "@/components/list/columns/enum-column";

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
                {tl("view_entity", { entity: tl("invoice") })}
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
