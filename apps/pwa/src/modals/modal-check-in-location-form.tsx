"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { ActionIcon, Group, Modal, NumberInput, Stack, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconGps, IconMapPin } from "@tabler/icons-react";
import { FC, useState } from "react";

import { CheckInLocation } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { t } from "@/modules/lang/lang-service";
import { getGeolocation } from "@/modules/locations/locations-service";
import { onActionLoad } from "@/utils/actions";
import { useDisclosure } from "@mantine/hooks";

interface ModalCheckInLocationFormProps {
  checkInLocation?: CheckInLocation;
  onDone: (checkInLocation: CheckInLocation) => void | Promise<void>;
}

export let OnModalCheckInLocationForm: (props: ModalCheckInLocationFormProps) => any = () => {};

export const ModalCheckInLocationForm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalCheckInLocationFormProps>();

  const form = useForm<CheckInLocation>({
    initialValues: props?.checkInLocation || {
      name: "",
      coordinates: { lat: 0, lng: 0 },
      radius: 100,
    },
    validate: {
      name: (value: string) => {
        if (!value) return t("required");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    props?.onDone(values);
    close();
  });

  OnModalCheckInLocationForm = (p) => {
    setProps(p);
    form.reset();
    form.setInitialValues(
      p.checkInLocation || {
        name: "",
        coordinates: { lat: 0, lng: 0 },
        radius: 10,
      }
    );
    open();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<ModalTitle title={t("check_in_location")} icon={IconMapPin} />}
      yOffset={16}
      zIndex={350}
    >
      <Stack>
        <TextInput
          withAsterisk
          label={t("name")}
          {...form.getInputProps("name")}
          placeholder={t("check_in_location_placeholder")}
        />

        <Group wrap="nowrap" gap={10} align="end">
          <NumberInput label="Latitue" {...form.getInputProps("coordinates.lat")} />

          <NumberInput label="Longitude" {...form.getInputProps("coordinates.lng")} />

          <Tooltip label={t("positioning")} zIndex={350}>
            <ActionIcon
              w={36}
              h={36}
              onClick={() =>
                onActionLoad({
                  process: () =>
                    getGeolocation().then((res) =>
                      form.setFieldValue("coordinates", {
                        lat: res.coords.latitude,
                        lng: res.coords.longitude,
                      })
                    ),
                })
              }
              size="lg"
            >
              <IconGps strokeWidth={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <NumberInput label={t("radius", { unit: t("meter") })} {...form.getInputProps("radius")} />

        <Button
          mt={10}
          type="submit"
          onClick={onSubmit}
          leftSection={<IconCheck strokeWidth={1.2} />}
          disabled={!form.isDirty()}
        >
          {t("complete")}
        </Button>
      </Stack>
    </Modal>
  );
};
