"use client";

import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { onSuccess } from "@/utils/actions";
import { requestTimekeeping } from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import { HrmTimekeepingType } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { getDateFormat, tl } from "@/modules/lang/lang-service";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
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
        if (!value) return tl("required");
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
      requestForm.setFieldError("checkInAt", tl("check_in_or_out_date_required"));
      return;
    }

    if (checkInAt && checkOutAt && checkInAt >= checkOutAt) {
      requestForm.setFieldError("checkInAt", tl("invalid_check_in_time"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (checkInAt) {
        await requestTimekeeping({
          time: DateTime.timeToSeconds(checkInAt),
          note: values.note!,
          type: HrmTimekeepingType.CHECK_IN,
        });
      }

      if (checkOutAt) {
        await requestTimekeeping({
          time: DateTime.timeToSeconds(checkOutAt),
          note: values.note!,
          type: HrmTimekeepingType.CHECK_OUT,
        });
      }

      onClose();
      onSuccess({
        title: tl("requested_title"),
        message: tl("requested_desc"),
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
        {tl("hrm_timekeepings_request")}
      </Text>

      <DatePickerInput
        label={tl("date")}
        valueFormat={getDateFormat()}
        {...requestForm.getInputProps("date")}
      />

      <SimpleGrid cols={2}>
        <TimeInput
          label={tl("hrm_timekeepings_check_in_at")}
          {...requestForm.getInputProps("checkInAt")}
        />

        <TimeInput
          label={tl("hrm_timekeepings_check_out_at")}
          {...requestForm.getInputProps("checkOutAt")}
        />
      </SimpleGrid>

      <Text c="gray" fz={em(12)}>
        • {tl("hrm_timekeepings_request_desc")}
      </Text>

      <Textarea
        label={tl("hrm_timekeepings_request_note")}
        placeholder={tl("hrm_timekeepings_request_note_placeholder")}
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
          {tl("confirm")}
        </Button>
      </Center>

      <Anchor ta="center" c="gray" fz={em(13)} onClick={onClose}>
        {tl("leave")}
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
