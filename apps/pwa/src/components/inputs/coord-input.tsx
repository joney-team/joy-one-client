"use client";

import { Coordinates } from "@/types";
import { getGeolocation } from "@/modules/locations/locations-service";
import {
  ActionIcon,
  Card,
  Group,
  InputWrapper,
  InputWrapperProps,
  NumberInput,
  Tooltip,
} from "@mantine/core";
import { IconGps } from "@tabler/icons-react";
import { FC, useState } from "react";

interface CoordInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: Coordinates;
  onChange?: (value?: Coordinates) => void;
}

export const CoordInput: FC<CoordInputProps> = (props) => {
  const [loading, setIsLoading] = useState(false);
  let _props = { ...props } as any;

  delete _props.value;
  delete _props.onChange;

  const getLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getGeolocation();
      props.onChange?.({ lat: location.coords.latitude, lng: location.coords.longitude });
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <InputWrapper {..._props}>
      <Card withBorder shadow="none" p={8}>
        <Group gap={10} py={3}>
          <NumberInput flex={1} value={props.value?.lat} placeholder="Lat" hideControls />
          <NumberInput flex={1} value={props.value?.lng} placeholder="Lng" hideControls />

          <Tooltip label="Lấy vị trí hiện tại">
            <ActionIcon size={36} loading={loading} onClick={getLocation}>
              <IconGps />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card>
    </InputWrapper>
  );
};
