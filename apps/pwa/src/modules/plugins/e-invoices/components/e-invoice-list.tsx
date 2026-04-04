"use client";

import { Button } from "@/components/buttons/button";
import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { EventType } from "@/graphql/enums.graphql";
import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { IconEye, IconFileInvoice } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, type FC } from "react";
import { type ModalReceiptDetailRef } from "../../../receipts/modals/modal-receipt-detail";
import { EInvoiceFragment } from "../graphql/fragmentEInvoice.graphql";
import GetEInvoicesDocument from "../graphql/getEInvoices.graphql";
import GetEInvoicesProviderInformationsDocument from "../graphql/getEInvoicesProviderInformations.graphql";

const ModalReceiptDetail = dynamic(
  () =>
    import("../../../receipts/modals/modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  },
);
export const EInvoiceList: FC = () => {
  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);
  const { data: providerConfigs } = useQuery(GetEInvoicesProviderInformationsDocument);

  return (
    <Stack p="md">
      <List<EInvoiceFragment>
        id="eis"
        name={<Trans>E-Invoices</Trans>}
        query={GetEInvoicesDocument}
        limit={18}
        icon={IconFileInvoice}
        columns={{
          receiptCode: codeColumn({
            defaultWidth: 200,
            name: <Trans>Receipt code</Trans>,
            onClick: (_, data) => modalReceiptDetailRef.current?.open(data.receiptId),
          }),
          createdAt: dateTimeColumn({
            name: <Trans>Created at</Trans>,
            sortable: true,
            isHasFilter: true,
          }),
          provider: enumColumn({
            defaultWidth: 400,
            name: <Trans>Provider</Trans>,
            valuePath: "provider.provider",
            options: Object.entries(providerConfigs?.getEInvoicesProviderInformations ?? {}).map(
              ([provider, info]) => ({
                label: info.name,
                value: provider,
              }),
            ),
          }),
          url: {
            name: <Trans>Invoice</Trans>,
            defaultWidth: 200,
            render: ({ data }) => (
              <Button
                onClick={() => window.open(data.url!, "_blank")}
                variant="light"
                leftIcon={IconEye}
                size="xs"
                disabled={!data.url}
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
