"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import GetReceiptByCodeDocument from "@/modules/receipts/graphql/getReceiptByCode.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Stack, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFileInvoice } from "@tabler/icons-react";
import JsonView from "@uiw/react-json-view";
import { FC, useState } from "react";
import GenerateEInvoiceDataDocument from "../graphql/generateEInvoiceData.graphql";

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
        query: GetReceiptByCodeDocument,
        variables: {
          code: receiptCode,
        },
      });

      if (!receipt?.data?.receipt) return;
      const result = await client.mutate({
        mutation: GenerateEInvoiceDataDocument,
        variables: {
          input: {
            receiptId: receipt.data?.receipt?.id,
          },
        },
      });
      if (result.data?.generateEInvoiceData) {
        setEInvoiceData(result.data?.generateEInvoiceData);
        localStorage.setItem("einvoice_code", receiptCode);
      }
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
          label={<Trans>Receipt code</Trans>}
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
    title: <ModalHead name={<Trans>Check invoice</Trans>} icon={IconFileInvoice} />,
    children: <ModalCheckEInvoice />,
  });
};
