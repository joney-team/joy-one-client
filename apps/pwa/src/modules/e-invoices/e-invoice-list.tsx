"use client";

import { Button } from "@/components/buttons/button";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { EventType } from "@/graphql/enums.graphql";
import { nonLoading } from "@/utils/non-loading";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconEye, IconFileInvoice } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, type FC } from "react";
import { useRestQuery } from "../apis/use-rest-query";
import { type PluginEInvoicesEntity } from "../plugins/e-invoices/plugin-e-invoices.entities";
import { type PluginEInvoicesProviderInformations } from "../plugins/e-invoices/plugin-e-invoices.types";
import { type ModalReceiptDetailRef } from "../receipts/modals/modal-receipt-detail";

const ModalReceiptDetail = dynamic(
  () => import("../receipts/modals/modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  }
);
export const EInvoiceList: FC = () => {
  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);
  const providerConfigs = useRestQuery<PluginEInvoicesProviderInformations>({
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
            onClick: (_, data) => modalReceiptDetailRef.current?.open(data.receiptId),
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
          EventType.ReceiptNew,
          EventType.ReceiptPaid,
          EventType.ReceiptUpdated,
          EventType.ReceiptDisbursement,
          EventType.ReceiptArchived,
          EventType.ReceiptUnarchived,
          EventType.ReceiptRevertPayment,
        ]}
      />

      <ModalReceiptDetail ref={modalReceiptDetailRef} />
    </Stack>
  );
};
