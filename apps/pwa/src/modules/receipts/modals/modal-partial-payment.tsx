"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { ModalHead } from "@/components/modal/modal-head";
import { useLang } from "@/modules/lang/lang-context";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { round } from "@/utils/number.utils";
import { useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Center, NumberInput, Slider, Stack, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconCircleHalf2 } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useState } from "react";
import { ReceiptDataFragment } from "../graphql/fragmentReceipt.graphql";
import MUTATION_PARTIAL_PAYMENT_RECEIPT from "../graphql/mutationPartialPaymentReceipt.graphql";

const ModalPayReceipt = dynamic(
  () => import("./modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  }
);

interface ModalPartialPaymentProps {
  onDone?: (receipts: ReceiptDataFragment[]) => void | Promise<void>;
  receipt: ReceiptDataFragment;
}

export const ModalPartialPayment: FC<ModalPartialPaymentProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lang = useLang();
  const dateFormat = DateTime.getDateFormatString(lang.locale);

  const [partialPaymentReceipt] = useMutation(MUTATION_PARTIAL_PAYMENT_RECEIPT);

  const form = useForm({
    initialValues: {
      amount: round(props.receipt.amount / 2, 0),
      nextExpireAt: undefined,
    } as any,
    validate: {
      amount: (value) => {
        if (value <= 0) return t`Minimum amount is ${5000}`;
      },
      nextExpireAt: (value) => {
        if (props.receipt.expireAt && (!value || value <= props.receipt.expireAt)) {
          return t`Invalid time`;
        }
      },
    },
  });

  const remainAmount = props.receipt.amount - form.values.amount;

  return (
    <ModalPayReceipt>
      {(modalPayReceipt) => {
        const onSubmit = form.onSubmit(async (values) => {
          setIsSubmitting(true);
          try {
            const result = await partialPaymentReceipt({
              variables: {
                partialPaymentReceiptId: props.receipt.id,
                input: values,
              },
            });
            if (!result.data) return;
            const receipts = result.data.partialPaymentReceipt;
            modals.close("ModalPartialPayment");
            modalPayReceipt.open({ receipt: receipts[0] });
          } catch (error) {
            onError(error);
          }
          setIsSubmitting(false);
        });

        return (
          <Stack>
            <NumberInput
              label={t`Amount`}
              min={5000}
              max={props.receipt.amount}
              hideControls
              {...form.getInputProps("amount")}
            />

            <Slider
              mb={20}
              marks={[
                { value: 20, label: "20%" },
                { value: 50, label: "50%" },
                { value: 80, label: "80%" },
              ]}
              value={round((form.values.amount / props.receipt.amount) * 100, 2)}
              onChange={(value) => {
                form.setFieldValue("amount", round((value / 100) * props.receipt.amount));
              }}
            />

            {props.receipt.expireAt && (
              <DateInput
                label={t`Next payment deadline`}
                valueFormat={dateFormat}
                {...form.getInputProps("nextExpireAt")}
                minDate={new Date()}
                value={DateTime.normalizeDate(form.values.nextExpireAt)}
                onChange={(date) => {
                  if (!date) return;
                  const range = DateTime.getRange(date, "day");
                  form.setFieldValue("nextExpireAt", DateTime.toSeconds(range.end));
                }}
              />
            )}

            <Text ta="center">
              <Trans>Remaining amount</Trans>: <CurrencyFormat value={remainAmount} />
            </Text>

            <Center>
              <Button
                mt={10}
                loading={isSubmitting}
                onClick={() => onSubmit()}
                leftSection={<IconCheck strokeWidth={1.2} />}
                disabled={!form.isDirty()}
                type="submit"
              >
                <Trans>Complete</Trans>
              </Button>
            </Center>
          </Stack>
        );
      }}
    </ModalPayReceipt>
  );
};

export const OnModalPartialPayment = (props: ModalPartialPaymentProps) => {
  return modals.open({
    modalId: "ModalPartialPayment",
    title: <ModalHead name={<Trans>Partial payment</Trans>} icon={IconCircleHalf2} />,
    children: <ModalPartialPayment {...props} />,
  });
};
