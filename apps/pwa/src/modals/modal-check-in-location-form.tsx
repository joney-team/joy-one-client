"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { ActionIcon, Group, Modal, NumberInput, Stack, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconGps, IconMapPin } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";

import { CheckInLocation } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { getGeolocation } from "@/modules/locations/locations-service";
import { onActionLoad } from "@/utils/actions";
import { zIndexes } from "@joy-one-client/config/layout";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useDisclosure } from "@mantine/hooks";

interface ModalCheckInLocationFormArgs {
  checkInLocation?: CheckInLocation;
  onDone: (checkInLocation: CheckInLocation) => void | Promise<void>;
}

export const ModalCheckInLocationForm: FC<{
  children: (open: (p: ModalCheckInLocationFormArgs) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [args, setArgs] = useState<ModalCheckInLocationFormArgs>();

  const form = useForm<CheckInLocation>({
    initialValues: args?.checkInLocation || {
      name: "",
      coordinates: { lat: 0, lng: 0 },
      radius: 100,
    },
    validate: {
      name: (value: string) => {
        if (!value) return t`Required`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    args?.onDone(values);
    close();
  });

  return (
    <Fragment>
      {children((p) => {
        setArgs(p);
        form.reset();
        form.setInitialValues(
          p.checkInLocation || {
            name: "",
            coordinates: { lat: 0, lng: 0 },
            radius: 10,
          }
        );
        open();
      })}

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={t`Check location`} icon={IconMapPin} />}
        yOffset={16}
        zIndex={zIndexes.commonModals}
      >
        <Stack>
          <TextInput
            withAsterisk
            label={t`Name`}
            {...form.getInputProps("name")}
            placeholder={t`Main office, Branch 1, ...`}
          />

          <Group wrap="nowrap" gap={10} align="end">
            <NumberInput label={t`Latitue`} {...form.getInputProps("coordinates.lat")} />
            <NumberInput label={t`Longitude`} {...form.getInputProps("coordinates.lng")} />

            <Tooltip label={t`Positioning`} zIndex={zIndexes.commonModals + 1}>
              <ActionIcon
                w={36}
                h={36}
                onClick={() =>
                  onActionLoad({
                    name: <Trans>Positioning</Trans>,
                    icon: IconGps,
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

          <NumberInput label={t`Radius (meter)`} {...form.getInputProps("radius")} />

          <Button
            mt={10}
            type="submit"
            onClick={() => onSubmit()}
            leftSection={<IconCheck strokeWidth={1.2} />}
            disabled={!form.isDirty()}
          >
            <Trans>Complete</Trans>
          </Button>
        </Stack>
      </Modal>
    </Fragment>
  );
};
