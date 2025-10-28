"use client";

import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { requestTimekeeping } from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import { HrmTimekeepingType } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { getDateFormat } from "@/modules/lang/lang-service";
import { onSuccess } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Anchor, Center, SimpleGrid, Stack, Text, Textarea, em } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck } from "@tabler/icons-react";
import { FC, useState } from "react";

export const ModalRequestTimekeeping: FC<{ date?: Date }> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = async () => {
    modals.close("ModalCaptureTimekeeping");
  };

  const requestForm = useForm<{
    note?: string;
    date?: Date;
    checkOutAt?: string;
    checkInAt?: string;
  }>({
    initialValues: {
      note: "",
      date: props.date || new Date(),
    },
    validate: {
      date: (value) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onRequest = requestForm.onSubmit(async (values) => {
    let checkInAt: Date | undefined = undefined;
    let checkOutAt: Date | undefined = undefined;

    if (values.checkInAt && values.checkInAt.split(":").length === 2) {
      checkInAt = new Date(
        new Date(values.date!).setHours(
          +values.checkInAt.split(":")[0],
          +values.checkInAt.split(":")[1]
        )
      );
    }

    if (values.checkOutAt && values.checkOutAt.split(":").length === 2) {
      checkOutAt = new Date(
        new Date(values.date!).setHours(
          +values.checkOutAt.split(":")[0],
          +values.checkOutAt.split(":")[1]
        )
      );
    }

    if (!values.checkInAt && !values.checkOutAt) {
      requestForm.setFieldError(
        "checkInAt",
        t`Need to select at least one of the check-in or check-out times`
      );
      return;
    }

    if (checkInAt && checkOutAt && checkInAt >= checkOutAt) {
      requestForm.setFieldError("checkInAt", t`Check-in time must be before check-out time`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (checkInAt) {
        await requestTimekeeping({
          time: DateTime.toSeconds(checkInAt),
          note: values.note!,
          type: HrmTimekeepingType.CHECK_IN,
        });
      }

      if (checkOutAt) {
        await requestTimekeeping({
          time: DateTime.toSeconds(checkOutAt),
          note: values.note!,
          type: HrmTimekeepingType.CHECK_OUT,
        });
      }

      onClose();
      onSuccess({
        title: t`Requested Timekeeping`,
        message: t`Please wait for the Timekeeping to be approved`,
      });
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack align="stretch" justify="center" gap={16} p={5}>
      <Center>
        <Image src={`/images/timekeeping-checkin.png`} w={em(180)} />
      </Center>

      <Text ta="center" fw={500} fz={em(22)} c="primary" tt="uppercase">
        {t`Request Timekeeping`}
      </Text>

      <DatePickerInput
        label={t`Date`}
        valueFormat={getDateFormat()}
        {...requestForm.getInputProps("date")}
      />

      <SimpleGrid cols={2}>
        <TimeInput label={t`Check-in at`} {...requestForm.getInputProps("checkInAt")} />

        <TimeInput label={t`Check-out at`} {...requestForm.getInputProps("checkOutAt")} />
      </SimpleGrid>

      <Text c="gray" fz={em(12)}>
        •{" "}
        <Trans>
          Can leave one of the check-in or check-out times blank if you have already checked in/out
          before
        </Trans>
      </Text>

      <Textarea
        label={t`Note for the approver`}
        placeholder={t`For example: Late, Early leave, ...`}
        {...requestForm.getInputProps("note")}
        styles={{
          input: {
            minHeight: 50,
          },
        }}
      />

      <Center mt={10}>
        <Button
          type="submit"
          rightSection={<IconCheck size={18} />}
          onClick={onRequest}
          loading={isSubmitting}
          action
        >
          <Trans>Confirm</Trans>
        </Button>
      </Center>

      <Anchor ta="center" c="gray" fz={em(13)} onClick={onClose}>
        <Trans>Leave</Trans>
      </Anchor>
    </Stack>
  );
};

export const OnModalCaptureTimekeeping = (date?: Date) =>
  modals.open({
    modalId: "ModalCaptureTimekeeping",
    children: <ModalRequestTimekeeping date={date} />,
    withCloseButton: false,
    closeOnEscape: false,
  });
