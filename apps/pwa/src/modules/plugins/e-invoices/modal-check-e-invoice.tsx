"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { ReceiptEntity } from "@/modules/receipts/receipts-types";
import { onError } from "@/utils/exceptions.utils";
import { Stack, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFileInvoice } from "@tabler/icons-react";
import { FC, useState } from "react";
import JsonView from "@uiw/react-json-view";

const ModalCheckEInvoice: FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eInvoiceData, setEInvoiceData] = useState<Record<string, unknown>>({});
  const [receiptCode, setReceiptCode] = useState(localStorage.getItem("einvoice_code") ?? "");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const receipt = await api.get<ReceiptEntity>(`/receipts/codes/${receiptCode}`);
      const data = await api.post(`/plugins/e-invoices/generate-data`, { receiptId: receipt.id });
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
          label={t("receipt_code")}
          value={receiptCode}
          onChange={(e) => setReceiptCode(e.target.value)}
        />

        <Button loading={isSubmitting} type="submit">
          {t("check_invoice")}
        </Button>

        {Object.keys(eInvoiceData).length > 0 && <JsonView value={eInvoiceData} />}
      </Stack>
    </form>
  );
};

export const OnModalCheckEInvoice = () => {
  modals.open({
    modalId: "OnModalCheckEInvoice",
    title: <ModalTitle title={t("check_invoice")} icon={IconFileInvoice} />,
    children: <ModalCheckEInvoice />,
  });
};
