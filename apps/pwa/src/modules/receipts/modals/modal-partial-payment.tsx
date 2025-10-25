import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { getDateFormat, num, tl } from "@/modules/lang/lang-service";
import { partialPaymentReceipt } from "@/modules/receipts/receipts-service";
import { ReceiptEntity } from "@/modules/receipts/receipts-types";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { round } from "@/utils/number.utils";
import { Center, NumberInput, Slider, Stack, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconCircleHalf2 } from "@tabler/icons-react";
import { FC, useState } from "react";
import { OnModalPayReceipt } from "./modal-pay-receipt";
import dayjs from "dayjs";

interface ModalPartialPaymentProps {
  onDone?: (receipts: ReceiptEntity[]) => void | Promise<void>;
  receipt: ReceiptEntity;
}

export const ModalPartialPayment: FC<ModalPartialPaymentProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      amount: round(props.receipt.amount / 2, 0),
      nextExpireAt: undefined,
    } as any,
    validate: {
      amount: (value) => {
        if (value <= 0) return tl("validate_min_amount", { min: 5000 });
      },
      nextExpireAt: (value) => {
        if (props.receipt.expireAt && (!value || value <= props.receipt.expireAt)) {
          return tl("invalid_time");
        }
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const { receipts } = await partialPaymentReceipt(props.receipt.id, values);
      modals.close("ModalPartialPayment");
      OnModalPayReceipt({ receipt: receipts[0] });
    } catch (error) {
      onError(error);
    }
    setIsSubmitting(false);
  });

  const remainAmount = props.receipt.amount - form.values.amount;

  return (
    <Stack>
      <NumberInput
        label={tl("money_amount")}
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
          label={tl("next_pay_date")}
          valueFormat={getDateFormat()}
          {...form.getInputProps("nextExpireAt")}
          minDate={new Date()}
          value={DateTime.secondsToTime(form.values.nextExpireAt)}
          onChange={(date) => {
            if (!date) return;
            const _date = dayjs(date).endOf("day");
            form.setFieldValue("nextExpireAt", DateTime.timeToSeconds(_date));
          }}
        />
      )}

      <Text ta="center">
        {tl("remain_money_amount")}: {num(remainAmount, { type: "money" })}
      </Text>

      <Center>
        <Button
          mt={10}
          loading={isSubmitting}
          onClick={onSubmit}
          leftSection={<IconCheck strokeWidth={1.2} />}
          disabled={!form.isDirty()}
          type="submit"
        >
          {tl("complete")}
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalPartialPayment = (props: ModalPartialPaymentProps) => {
  return modals.open({
    modalId: "ModalPartialPayment",
    title: <ModalTitle title={tl("partial_payment")} icon={IconCircleHalf2} />,
    children: <ModalPartialPayment {...props} />,
  });
};
