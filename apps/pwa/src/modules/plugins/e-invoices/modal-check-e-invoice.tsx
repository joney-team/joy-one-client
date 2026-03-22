"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { restClient } from "@/modules/apis/rest-client";
import QUERY_RECEIPT_BY_CODE from "@/modules/receipts/graphql/queryReceiptByCode.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Stack, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFileInvoice } from "@tabler/icons-react";
import JsonView from "@uiw/react-json-view";
import { FC, useState } from "react";

const ModalCheckEInvoice: FC = () => {
  const client = useApolloClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eInvoiceData, setEInvoiceData] = useState<Record<string, unknown>>({});
  const [receiptCode, setReceiptCode] = useState(localStorage.getItem("einvoice_code") ?? "");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const receipt = await client.query({
        query: QUERY_RECEIPT_BY_CODE,
        variables: {
          code: receiptCode,
        },
      });
      const data = await restClient.post(`/plugins/e-invoices/generate-data`, {
        receiptId: receipt.data?.receiptByCode?.id,
      });
      setEInvoiceData(data);
      localStorage.setItem("einvoice_code", receiptCode);
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label={t`Receipt code`}
          value={receiptCode}
          onChange={(e) => setReceiptCode(e.target.value)}
        />

        <Button loading={isSubmitting} type="submit">
          <Trans>Check invoice</Trans>
        </Button>

        {Object.keys(eInvoiceData).length > 0 && <JsonView value={eInvoiceData} />}
      </Stack>
    </form>
  );
};

export const OnModalCheckEInvoice = () => {
  modals.open({
    modalId: "OnModalCheckEInvoice",
    title: <ModalHead name={t`Check invoice`} icon={IconFileInvoice} />,
    children: <ModalCheckEInvoice />,
  });
};
