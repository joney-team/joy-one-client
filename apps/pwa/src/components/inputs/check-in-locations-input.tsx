import { Coordinates } from "@/types";
import { OnModalCheckInLocationForm } from "@/modals/modal-check-in-location-form";
import { CheckInLocation } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { t } from "@/modules/lang/lang-service";
import { calculateDistance, getGeolocation } from "@/modules/locations/locations-service";
import { onActionLoad } from "@/utils/actions";
import { capitalize, StringUtils } from "@/utils/string.utils";
import {
  ActionIcon,
  Card,
  em,
  Group,
  InputWrapper,
  InputWrapperProps,
  NumberInput,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconGps, IconLocationFilled, IconMapCheck, IconPlus, IconX } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "../buttons/button";

interface CheckInLocationsInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: CheckInLocation[];
  onChange?: (value: CheckInLocation[]) => void;
  editable?: boolean;
}

export const CheckInLocationsInput: FC<CheckInLocationsInputProps> = (props) => {
  const { value, onChange, editable, ...rest } = props;
  const locations = props.value || [];

  return (
    <InputWrapper {...rest}>
      <Stack gap={10} py={3}>
        {locations.map((location, index) => {
          const check = async () => {
            onActionLoad({
              name: t("check_location"),
              icon: IconGps,
              process: () => getGeolocation(),
              onFinished: (res, id) => {
                const coords: Coordinates = {
                  lat: res.coords.latitude,
                  lng: res.coords.longitude,
                };

                const distance = calculateDistance(coords, location.coordinates);
                if (distance <= location.radius) {
                  notifications.update({
                    id,
                    title: t("arrived_location", { location: location.name }),
                    message: t("timekeepings_arrived_location_desc"),
                    icon: <IconMapCheck strokeWidth={1.5} size={18} />,
                    color: "primary",
                    autoClose: 3000,
                  });
                } else {
                  notifications.update({
                    id,
                    title: t("outside_check_in_location"),
                    message: t("outside_check_in_location_desc"),
                    icon: <IconX strokeWidth={1.5} size={18} />,
                    color: "red",
                    autoClose: 3000,
                  });
                }
              },
            });
          };

          const remove = () => {
            props.onChange?.(locations.filter((_, i) => i !== index));
          };

          const toggleDisable = () => {
            props.onChange?.(
              locations.map((loc, i) => {
                if (i === index) {
                  return {
                    ...loc,
                    disabled: !loc.disabled,
                  };
                }

                return loc;
              })
            );
          };

          const changeRadius = (value: number) => {
            props.onChange?.(
              locations.map((loc, i) => {
                if (i === index) return { ...loc, radius: value };
                return loc;
              })
            );
          };

          return (
            <Card key={index} withBorder shadow="none" p={10}>
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={8}>
                  <Stack gap={0}>
                    <Text fz={em(16)} fw={500}>
                      {location.name}
                    </Text>
                    <Text c="gray" fz={em(12)} fw={500}>
                      {t("coordinates")}: {StringUtils.limitCharacters(location.coordinates.lat.toString(), 15)}/
                      {StringUtils.limitCharacters(location.coordinates.lng.toString(), 15)}
                    </Text>
                  </Stack>

                  <Switch checked={!location.disabled} label={t("on_off_activate")} onChange={toggleDisable} mb={5} />

                  <NumberInput
                    label={t("radius", { unit: t("meter") })}
                    value={location.radius}
                    onChange={(e) => changeRadius(+e)}
                    min={0}
                    step={10}
                    w={100}
                  />
                </Stack>

                <Group gap={8} wrap="nowrap" mt={10}>
                  <ActionIcon color="primary" variant="filled" onClick={check}>
                    <IconLocationFilled strokeWidth={1.5} size={16} />
                  </ActionIcon>

                  <ActionIcon color="gray" variant="outline" onClick={remove}>
                    <IconX strokeWidth={1.5} size={22} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          );
        })}

        {props.onChange && (
          <Group>
            <Button
              size="compact-xs"
              variant="outline"
              onClick={() =>
                OnModalCheckInLocationForm({
                  onDone: (checkInLocation) => {
                    props.onChange?.([...locations, checkInLocation]);
                  },
                })
              }
              leftSection={<IconPlus size={16} style={{ marginRight: -8 }} />}
              fz={em(13)}
            >
              {capitalize(`${t("add")} ${t("location")}`)}
            </Button>
          </Group>
        )}
      </Stack>
    </InputWrapper>
  );
};
