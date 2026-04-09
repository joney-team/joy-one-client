"use client";

import { Button } from "@/components/buttons/button";
import { DateInput } from "@/components/inputs/date-input";
import { ModalHead } from "@/components/modal/modal-head";
import { ReceiptType } from "@/graphql/enums.graphql";
import { useAuth } from "@/modules/auth/auth-context";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { CustomerFragment } from "@/modules/customers/graphql/fragmentCustomer.graphql";
import { FilesBox } from "@/modules/files/files-box";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { LoanFragment } from "@/modules/loans/graphql/fragmentLoan.graphql";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { onFormErrorBinding } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Card, Center, Group, InputWrapper, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconCheck } from "@tabler/icons-react";
import { FC, useState } from "react";
import CreateReceiptDocument from "../graphql/createReceipt.graphql";
import { ReceiptFragment } from "../graphql/fragmentReceipt.graphql";
import { receiptTypes } from "../receipt-constants";

interface ReceiptFormValues {
  amount: number;
  type: ReceiptType;
  note?: string;
  data?: any;
  relatedCustomer?: Pick<CustomerFragment, "_id" | "name" | "avatar" | "phone"> | undefined;
  relatedLoan?: LoanFragment | undefined;
  expireAt?: number | null;
}

interface ModalReceiptFormProps {
  type?: ReceiptType;
  data?: any;
  relatedCustomer?: Pick<CustomerFragment, "_id" | "name" | "avatar" | "phone">;
  relatedLoan?: LoanFragment;
  onDone?: (receipt: ReceiptFragment) => Promise<any> | any;
}

export const ModalReceiptForm: FC<ModalReceiptFormProps> = (props) => {
  const auth = useAuth();
  const color = useColor();
  const uploadFile = useUploadFile();
  const { t } = useLingui();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);

  const [createReceipt] = useMutation(CreateReceiptDocument);

  const form = useForm<ReceiptFormValues>({
    initialValues: {
      amount: 0,
      note: "",
      type: props.type || ReceiptType.Income,
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
      variables: {
        input: {
          amount: values.amount,
          type: values.type,
          note: values.note,
          data: values.data,
          expireAt: values.expireAt ?? null,
          relatedCustomerId: values.relatedCustomer?._id,
          relatedLoanId: values.relatedLoan?.id,
          assigneeUserIds: [auth.user._id],
        },
      },
    })
      .then(async (receipt) => {
        if (!receipt.data?.createReceipt) return;

        await Promise.all(
          receiptFiles.map((file) =>
            uploadFile(file, {
              refs: [`${AppEntity.RECEIPTS}:${receipt.data?.createReceipt.id}`],
            }),
          ),
        );

        await props.onDone?.(receipt.data?.createReceipt);
        modals.close("ModalReceiptForm");
      })
      .catch(onFormErrorBinding(form));

    setIsSubmitting(false);
  });

  return (
    <Stack>
      {!props.type && (
        <InputWrapper label={<Trans>Type</Trans>}>
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
                  {t(config.label)}
                </Button>
              );
            })}
          </Group>
        </InputWrapper>
      )}

      <NumberInput
        label={<Trans>Money amount</Trans>}
        withAsterisk
        hideControls
        {...form.getInputProps("amount")}
      />

      <Textarea label={<Trans>Note</Trans>} {...form.getInputProps("note")} />

      <DateInput
        label={<Trans>Payment deadline</Trans>}
        value={form.values.expireAt}
        onChange={(date) => {
          form.setFieldValue("expireAt", date);
        }}
      />

      <CustomerInput
        label={<Trans>Customer</Trans>}
        value={form.values.relatedCustomer}
        onSelect={(value) => form.setFieldValue("relatedCustomer", value as any)}
        disabled={!!props.relatedCustomer}
      />

      <InputWrapper label={<Trans>Files</Trans>}>
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
          loading={isSubmitting}
          onClick={() => onSubmit()}
          leftIcon={IconCheck}
          disabled={!form.isDirty()}
          color={color(receiptTypes[form.values.type].color)}
        >
          <Trans>Complete</Trans>
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalReceiptForm = (props?: ModalReceiptFormProps) => {
  return modals.open({
    modalId: "ModalReceiptForm",
    title: <ModalHead name={<Trans>Create receipt</Trans>} icon={IconCashRegister} />,
    children: <ModalReceiptForm {...props} />,
  });
};
