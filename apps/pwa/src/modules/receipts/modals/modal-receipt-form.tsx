"use client";

import { Button } from "@/components/buttons/button";
import { DateInput } from "@/components/inputs/date-input";
import { ModalHead } from "@/components/modal/modal-head";
import { useAuth } from "@/modules/auth/auth-context";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { FilesBox } from "@/modules/files/files-box";
import { LoanEntity } from "@/modules/loans/loans-types";
import { createReceipt, receiptTypeColors } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptType } from "@/modules/receipts/receipts-types";
import { useColor } from "@/modules/theme/use-color";
import { onFormErrorLegacy } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Card, Center, Group, InputWrapper, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconCheck } from "@tabler/icons-react";
import { FC, useState } from "react";
import { receiptTypes } from "../receipt-constants";
import { AppEntity } from "@/types";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";

interface ReceiptFormValues {
  amount: number;
  type: ReceiptType;
  note?: string;
  data?: any;
  relatedCustomer?: CustomerShortInfo | undefined;
  relatedLoan?: LoanEntity | undefined;
  expireAt?: number | null;
}

interface ModalReceiptFormProps {
  type?: ReceiptType;
  data?: any;
  relatedCustomer?: CustomerShortInfo;
  relatedLoan?: LoanEntity;
  onDone?: (receipt: ReceiptEntity) => Promise<any> | any;
}

export const ModalReceiptForm: FC<ModalReceiptFormProps> = (props) => {
  const auth = useAuth();
  const color = useColor();
  const uploadFile = useUploadFile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);

  const form = useForm<ReceiptFormValues>({
    initialValues: {
      amount: 0,
      note: "",
      type: props.type || ReceiptType.INCOME,
      data: props.data || {},
      relatedCustomer: props.relatedCustomer,
      relatedLoan: props.relatedLoan,
    },
    validate: {
      amount: (value) => {
        if (!value) return t`Required`;
        if (value <= 0) return t`Invalid money amount`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    await createReceipt({
      amount: values.amount,
      type: values.type,
      note: values.note,
      data: values.data,
      expireAt: values.expireAt ?? null,
      relatedCustomerId: values.relatedCustomer?._id,
      relatedLoanId: values.relatedLoan?.id,
      assigneeUserIds: [auth.user._id],
    })
      .then(async (receipt) => {
        await Promise.all(
          receiptFiles.map((file) =>
            uploadFile(file, {
              refs: [`${AppEntity.RECEIPTS}:${receipt.id}`],
            })
          )
        );

        await props.onDone?.(receipt);
        modals.close("ModalReceiptForm");
      })
      .catch(onFormErrorLegacy(form));

    setIsSubmitting(false);
  });

  return (
    <Stack>
      {!props.type && (
        <InputWrapper label={t`Type`}>
          <Group pt={5} gap={10}>
            {Object.entries(receiptTypes).map(([type, config]) => {
              return (
                <Button
                  key={type}
                  variant={form.values.type === (type as ReceiptType) ? "filled" : "outline"}
                  onClick={() => form.setFieldValue("type", type as ReceiptType)}
                  color={color(config.color)}
                  leftIcon={config.icon}
                >
                  {config.label()}
                </Button>
              );
            })}
          </Group>
        </InputWrapper>
      )}

      <NumberInput label={t`Amount`} withAsterisk hideControls {...form.getInputProps("amount")} />

      <Textarea label={t`Note`} {...form.getInputProps("note")} />

      <DateInput
        label={t`Payment deadline`}
        value={form.values.expireAt}
        onChange={(date) => {
          form.setFieldValue("expireAt", date);
        }}
      />

      <CustomerInput
        label={t`Customer`}
        value={form.values.relatedCustomer}
        onSelect={(value) => form.setFieldValue("relatedCustomer", value as any)}
        disabled={!!props.relatedCustomer}
      />

      <InputWrapper label={t`Files`}>
        <Card p={10} withBorder mt={5}>
          <FilesBox
            onChangeRawFiles={(_files) => setReceiptFiles(_files)}
            filesWrapperProps={{
              justify: "center",
            }}
          />
        </Card>
      </InputWrapper>

      <Center mt={10}>
        <Button
          action
          loading={isSubmitting}
          onClick={() => onSubmit()}
          leftIcon={IconCheck}
          disabled={!form.isDirty()}
          color={color(receiptTypeColors[form.values.type])}
        >
          {t`Complete`}
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalReceiptForm = (props?: ModalReceiptFormProps) => {
  return modals.open({
    modalId: "ModalReceiptForm",
    title: <ModalHead name={t`Create receipt`} icon={IconCashRegister} />,
    children: <ModalReceiptForm {...props} />,
  });
};
