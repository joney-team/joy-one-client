"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { AttendanceSettingLocationInput } from "@/graphql/types.graphql";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, InputWrapper, Skeleton, Stack, Text } from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useRef, useState } from "react";
import { AttendanceSettingFragment } from "./graphql/fragmentAttendanceSetting.graphql";
import { useAttendanceSetting } from "./hooks/use-attendance-setting";
import { type ModalAttendanceSettingLocationFormRef } from "./modals/modal-attendance-setting-location-form";
import { useMutation } from "@apollo/client/react";
import UPLOAD_ATTENDANCE_SETTING_MUTATION from "./graphql/mutationUpdateAttendanceSetting.graphql";

const ModalAttendanceSettingLocationForm = dynamic(
  () =>
    import("./modals/modal-attendance-setting-location-form").then(
      (mod) => mod.ModalAttendanceSettingLocationForm,
    ),
  { ssr: false, loading: nonLoading },
);

const AttendanceSettingCard: FC<{ setting: AttendanceSettingFragment }> = ({ setting }) => {
  const [locations, setLocations] = useState<AttendanceSettingLocationInput[]>(
    setting.locations ?? [],
  );
  const modalAttendanceSettingLocationFormRef = useRef<ModalAttendanceSettingLocationFormRef>(null);

  const [uploadAttendanceSetting] = useMutation(UPLOAD_ATTENDANCE_SETTING_MUTATION);

  const onApply = async () => {
    await uploadAttendanceSetting({
      variables: {
        input: {
          locations,
        },
      },
    });
  };

  return (
    <Stack>
      <InputWrapper
        label={<Trans>Locations</Trans>}
        description={<Trans>Define the allowed locations for attendance</Trans>}
      >
        <Stack>
          {locations.map((location) => (
            <Card key={location.id} shadow="none" withBorder>
              <Group justify="space-between">
                <Stack gap={0}>
                  <Text fw={500}>{location.name}</Text>
                  <Text size="sm" c="dimmed">
                    {location.coordinates.lat}, {location.coordinates.lng} -{" "}
                    {location.allowedDistanceInMeters}m
                  </Text>
                </Stack>

                <Group>
                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    size="xs"
                    onClick={() =>
                      modalAttendanceSettingLocationFormRef.current?.open({
                        location,
                        onFinish: (updatedLocation) => {
                          setLocations((prev) =>
                            prev.map((loc) =>
                              loc.id === updatedLocation.id ? updatedLocation : loc,
                            ),
                          );
                        },
                      })
                    }
                  >
                    <IconEdit size={16} />
                  </ActionIcon>

                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    size="xs"
                    onClick={() =>
                      setLocations((prev) => prev.filter((loc) => loc.id !== location.id))
                    }
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}

          <Button
            size="compact-sm"
            variant="outline"
            color="gray"
            onClick={() =>
              modalAttendanceSettingLocationFormRef.current?.open({
                onFinish: (location) => {
                  setLocations((prev) => [...prev, location]);
                },
              })
            }
            leftIcon={IconPlus}
          >
            <Trans>Add</Trans>
          </Button>
          <ModalAttendanceSettingLocationForm ref={modalAttendanceSettingLocationFormRef} />
        </Stack>
      </InputWrapper>

      <Group justify="center">
        <Button onClick={onApply}>
          <Trans>Apply</Trans>
        </Button>
      </Group>
    </Stack>
  );
};

export const AttendanceSetting: FC = () => {
  const { attendanceSetting, loading, error } = useAttendanceSetting();

  if (loading) {
    return (
      <Container py="md" size="xs">
        <Skeleton height={300} />
      </Container>
    );
  }

  if (error || !attendanceSetting) {
    return (
      <Container py="md" size="xs">
        <Errored error={error} />
      </Container>
    );
  }

  return (
    <Container py="md" size="xs">
      <Card>
        <AttendanceSettingCard setting={attendanceSetting} />
      </Card>
    </Container>
  );
};
