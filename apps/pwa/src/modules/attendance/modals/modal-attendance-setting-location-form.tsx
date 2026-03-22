import { FC, forwardRef, Fragment, useImperativeHandle, useRef, useState } from "react";
import { AttendanceSettingFragment } from "../graphql/fragmentAttendanceSetting.graphql";
import { Modal } from "@/components/modal/modal";
import { Trans, useLingui } from "@lingui/react/macro";
import { Group, NumberInput, Stack, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconBrandGoogleMaps, IconGps } from "@tabler/icons-react";
import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { AttendanceSettingLocationInput } from "@/graphql/types.graphql";
import { v4 as uuidv4 } from "uuid";
import { ActionIcon } from "@/components/action-icon/action-icon";
import { InputModalType, ModalInput, ModalInputRef } from "@/modals/modal-input";
import { onError } from "@/utils/exceptions.utils";
import { parseGoogleMapsUrl } from "@/modules/locations/locations-service";
import { all } from "axios";

export interface ModalAttendanceSettingLocationFormState {
  location?: AttendanceSettingLocationInput;
  onFinish: (location: AttendanceSettingLocationInput) => void;
}

export interface ModalAttendanceSettingLocationFormRef {
  open: (state: ModalAttendanceSettingLocationFormState) => void;
}

const LocationForm: FC<ModalAttendanceSettingLocationFormState & { onClose: () => void }> = (
  props,
) => {
  const { t } = useLingui();
  const modalInputRef = useRef<ModalInputRef>(null);

  const form = useForm({
    initialValues: {
      id: props.location?.id ?? uuidv4(),
      name: props.location?.name ?? undefined,
      allowedDistanceInMeters: props.location?.allowedDistanceInMeters ?? 100,
      coordinates: {
        lat: props.location?.coordinates?.lat ?? undefined,
        lng: props.location?.coordinates?.lng ?? undefined,
      },
    },
    validate: {
      name: (value) => (value ? null : t`Name is required`),
      coordinates: {
        lat: (value) => {
          if (!value) {
            return t`Invalid latitude`;
          }
        },
        lng: (value) => {
          if (!value) {
            return t`Invalid longitude`;
          }
        },
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    props.onFinish({
      id: values.id,
      name: values.name,
      allowedDistanceInMeters: values.allowedDistanceInMeters,
      coordinates: {
        lat: values.coordinates.lat!,
        lng: values.coordinates.lng!,
      },
    });
  });

  return (
    <Fragment>
      <Form onSubmit={onSubmit}>
        <Stack>
          <Group align="start" gap="xs">
            <NumberInput
              flex={1}
              label={<Trans>Latitude</Trans>}
              {...form.getInputProps("coordinates.lat")}
            />
            <NumberInput
              flex={1}
              label={<Trans>Longitude</Trans>}
              {...form.getInputProps("coordinates.lng")}
            />

            <Tooltip
              label={
                <Trans>Enter a Google Maps link to automatically fill in the coordinates</Trans>
              }
            >
              <ActionIcon
                color="gray"
                variant="light"
                size={36}
                mt={24}
                onClick={() =>
                  modalInputRef.current?.open({
                    type: InputModalType.TEXT,
                    title: t`Enter Google Maps Link`,
                    placeholder: `Ex: https://www.google.com/maps/place/Statue+of+Liberty/@40.6892494,-74.0445004,17z`,
                    onDone(value) {
                      try {
                        const parsed = parseGoogleMapsUrl(value);
                        const lat = parsed.placeLat || parsed.viewLat;
                        const lng = parsed.placeLng || parsed.viewLng;

                        if (!lat || !lng) {
                          throw new Error(t`Invalid google maps link`);
                        } else {
                          form.setFieldValue("coordinates.lat", lat);
                          form.setFieldValue("coordinates.lng", lng);
                        }

                        if (parsed.placeName) {
                          form.setFieldValue("name", parsed.placeName);
                        }
                      } catch (error) {
                        onError(error);
                      }
                    },
                  })
                }
              >
                <IconBrandGoogleMaps size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <NumberInput
            label={<Trans>Allowed Distance (meters)</Trans>}
            {...form.getInputProps("allowedDistanceInMeters")}
          />

          <TextInput
            label={
              <Fragment>
                <Trans>Name</Trans>{" "}
                <span className="optional-flag">
                  (<Trans>Optional</Trans>)
                </span>
              </Fragment>
            }
            {...form.getInputProps("name")}
          />

          <Button type="submit">
            <Trans>Save</Trans>
          </Button>
        </Stack>
      </Form>

      <ModalInput ref={modalInputRef} />
    </Fragment>
  );
};

export const ModalAttendanceSettingLocationForm = forwardRef<ModalAttendanceSettingLocationFormRef>(
  (_, ref) => {
    const [state, setState] = useState<ModalAttendanceSettingLocationFormState | null>(null);

    const onClose = () => {
      setState(null);
    };

    useImperativeHandle(ref, () => ({
      open: (state) => {
        setState(state);
      },
    }));

    return (
      <Modal
        icon={IconGps}
        name={<Trans>Location Settings</Trans>}
        onClose={onClose}
        opened={!!state}
      >
        {state && (
          <LocationForm
            {...state}
            onClose={onClose}
            onFinish={(location) => {
              state.onFinish(location);
              setState(null);
            }}
          />
        )}
      </Modal>
    );
  },
);
