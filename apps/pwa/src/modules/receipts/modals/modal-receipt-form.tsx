import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { FilesBox } from "@/modules/files/files-box";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { ModalTitle } from "@/components/modal-title";
import { useAuth } from "@/modules/auth/auth-context";
import { CustomerEntity, CustomerShortInfo } from "@/modules/customers/customer-types";
import { onUploadFile } from "@/modules/files/file-service";
import { getDateFormat, t } from "@/modules/lang/lang-service";
import { LoanEntity } from "@/modules/loans/loans-types";
import {
  createReceipt,
  receiptTypeColors,
  receiptTypeIcons,
} from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptType } from "@/modules/receipts/receipts-types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import { onFormErrorLegacy } from "@/utils/exceptions.utils";
import { Card, Center, Group, InputWrapper, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconCheck } from "@tabler/icons-react";
import { FC, useState } from "react";
import { DateInput } from "@/components/inputs/date-input";

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
        if (!value) return t("required");
        if (value <= 0) return t("invalid_money_amount");
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
            onUploadFile({
              file,
              relatedReceiptId: receipt.id,
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
        <InputWrapper label={t("type")}>
          <Group pt={5} gap={10}>
            {Object.values(ReceiptType).map((type) => {
              return (
                <Button
                  key={type}
                  variant={form.values.type === type ? "filled" : "outline"}
                  onClick={() => form.setFieldValue("type", type)}
                  color={color(receiptTypeColors[type])}
                  leftIcon={receiptTypeIcons[type]}
                >
                  {t(`receipt_type_${type}`)}
                </Button>
              );
            })}
          </Group>
        </InputWrapper>
      )}

      <NumberInput
        label={t("money_amount")}
        withAsterisk
        hideControls
        {...form.getInputProps("amount")}
      />

      <Textarea label={t("note")} {...form.getInputProps("note")} />

      <DateInput
        label={t("pay_expire")}
        value={form.values.expireAt}
        onChange={(date) => {
          form.setFieldValue("expireAt", date);
        }}
      />

      <CustomerInput
        label={t("customer")}
        value={form.values.relatedCustomer}
        onSelect={(value) => form.setFieldValue("relatedCustomer", value)}
        disabled={!!props.relatedCustomer}
      />

      <InputWrapper label={t("files")}>
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
          onClick={onSubmit}
          leftIcon={IconCheck}
          disabled={!form.isDirty()}
          color={color(receiptTypeColors[form.values.type])}
        >
          {t("complete")}
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalReceiptForm = (props?: ModalReceiptFormProps) => {
  return modals.open({
    modalId: "ModalReceiptForm",
    title: <ModalTitle title={`${t("create")} ${t("receipt")}`} icon={IconCashRegister} />,
    children: <ModalReceiptForm {...props} />,
  });
};
