"use client";

import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { AttendanceSettingLocationInput } from "@/graphql/types.graphql";
import { nonLoading } from "@/utils/non-loading";
import { useMutation } from "@apollo/client/react";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, InputWrapper, Skeleton, Stack, Text } from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useRef, useState } from "react";
import { AttendanceSettingFragment } from "./graphql/fragmentAttendanceSetting.graphql";
import UPLOAD_ATTENDANCE_SETTING_MUTATION from "./graphql/mutationUpdateAttendanceSetting.graphql";
import { useAttendanceSetting } from "./hooks/use-attendance-setting";
import { type ModalAttendanceSettingLocationFormRef } from "./modals/modal-attendance-setting-location-form";

const ModalAttendanceSettingLocationForm = dynamic(
  () =>
    import("./modals/modal-attendance-setting-location-form").then(
      (mod) => mod.ModalAttendanceSettingLocationForm,
    ),
  { ssr: false, loading: nonLoading },
);

const AttendanceSettingContent: FC<{ setting: AttendanceSettingFragment }> = ({ setting }) => {
  const [locations, setLocations] = useState<AttendanceSettingLocationInput[]>(
    removeTypeName(setting.locations ?? []),
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

  useEffect(() => {
    const isDiff =
      JSON.stringify(removeTypeName(setting.locations ?? [])) !== JSON.stringify(locations);
    if (!isDiff) return;

    const timeout = setTimeout(() => {
      onApply();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [setting.locations, locations]);

  return (
    <Stack>
      <InputWrapper
        label={<Trans>Attendance locations</Trans>}
        description={<Trans>Define the allowed locations for attendance</Trans>}
      >
        <Stack pt="sm">
          {locations.map((location) => (
            <Card key={location.id} shadow="none" withBorder>
              <Group justify="space-between" wrap="nowrap">
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

          <Group>
            <Button
              size="xs"
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
              <Trans>Add location</Trans>
            </Button>
          </Group>
          <ModalAttendanceSettingLocationForm ref={modalAttendanceSettingLocationFormRef} />
        </Stack>
      </InputWrapper>
    </Stack>
  );
};

export const AttendanceSetting: FC = () => {
  const { attendanceSetting, loading, error } = useAttendanceSetting();

  if (loading) {
    return <Skeleton height={200} />;
  }

  if (error || !attendanceSetting) {
    return <Errored error={error} />;
  }

  return <AttendanceSettingContent setting={attendanceSetting} />;
};
