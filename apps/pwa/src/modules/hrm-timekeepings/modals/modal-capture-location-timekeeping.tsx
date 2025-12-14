"use client";

import { Button } from "@/components/buttons/button";
import { WithCamera } from "@/components/camera";
import { Errored } from "@/components/errored";
import { DateFormat } from "@/components/format/date-format";
import { TimekeepingsIllustration } from "@/components/illustrations/timekeepings";
import { Image } from "@/components/image";
import { Loading } from "@/components/loading";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import {
  captureLocationTimekeeping,
  getPreviousTimeKeeping,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingStatus,
  HrmTimekeepingType,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import {
  findAvailableLocationToCheckIn,
  getGeolocation,
} from "@/modules/locations/locations-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Anchor, Card, Center, em, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCamera, IconCameraSelfie, IconCheck } from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";

export const ModalCaptureLocationTimekeeping: FC = () => {
  const workspace = useWorkspace();
  const color = useColor();
  const uploadFile = useUploadFile();

  const acceptLocations = workspace.settings.hrmTimeKeepingsRules?.acceptLocations || [];
  const geolocation = useFetch({ fetch: () => getGeolocation() });

  const [timekeeping, setTimekeeping] = useState<HrmTimekeepingEntity>();
  const [file, setFile] = useState<File>();

  const checkInLocation = geolocation.data
    ? findAvailableLocationToCheckIn(
        {
          lat: geolocation.data.coords.latitude,
          lng: geolocation.data.coords.longitude,
        },
        acceptLocations || []
      )
    : undefined;

  const prevTimekeeping = useFetch({
    fetch: () => getPreviousTimeKeeping(),
  });

  const onClose = async () => modals.close("ModalCaptureLocationTimekeeping");

  const onLocation = async () => {
    try {
      if (!checkInLocation || !geolocation.data || !file)
        throw Error(t`Not enough condition to Check-in/out`);

      const coordinates = {
        lat: geolocation.data.coords.latitude,
        lng: geolocation.data.coords.longitude,
      };

      const timekeeping = await captureLocationTimekeeping({ coordinates });

      await uploadFile(file, {
        compressSize: 1,
        refs: [`${AppEntity.HRM_TIMEKEEPINGS}:${timekeeping._id}`],
      });

      setTimekeeping(timekeeping);
      setTimeout(onClose, 3000);
    } catch (error) {
      onError(error);
    }
  };

  if (timekeeping) {
    const timekeepingColor =
      timekeeping.type === HrmTimekeepingType.CHECK_IN ? "primary" : "orange";

    return (
      <Stack align="stretch" justify="center" gap={16} pt={16}>
        <Center>
          <TimekeepingsIllustration width={180} color={timekeepingColor} />
        </Center>

        <Text ta="center" c={color(timekeepingColor)} fw={500} fz={em(22)}>
          {timekeeping.type === HrmTimekeepingType.CHECK_IN
            ? t`Check in successfully`
            : t`Check out successfully`}
        </Text>

        {timekeeping.status === HrmTimekeepingStatus.PENDING ? (
          <Text ta="center">
            <Trans>Your Check-in/out is pending approval</Trans>
          </Text>
        ) : (
          <Fragment>
            {timekeeping.type === HrmTimekeepingType.CHECK_IN ? (
              <Text ta="center" c="dark">
                <Trans>
                  Thank you <strong>{workspace.userMember.name}</strong>! <br /> Wish you a
                  successful work.
                </Trans>
              </Text>
            ) : (
              <Text ta="center" c="dark">
                <Trans>
                  Thank you for the effort of <strong>{workspace.userMember.name}</strong>. Please
                  take some time to rest. Wish you a lot of health!
                </Trans>
              </Text>
            )}
          </Fragment>
        )}

        <Anchor ta="center" c="gray" fz={em(13)} onClick={onClose}>
          <Trans>Leave</Trans>
        </Anchor>
      </Stack>
    );
  }

  const prevType = prevTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
  const nextType =
    prevType === HrmTimekeepingType.CHECK_IN
      ? HrmTimekeepingType.CHECK_OUT
      : HrmTimekeepingType.CHECK_IN;
  const nextColor = nextType === HrmTimekeepingType.CHECK_IN ? "primary" : "orange";

  return (
    <WithCamera>
      {(camera) => {
        const onTakePhoto = () => {
          camera.onTakePhoto({
            defaultCameraPosition: "front",
            onCaputure: (_file) => {
              setFile(_file);
            },
          });
        };

        return (
          <Stack align="stretch" justify="center" gap={10} pt={16}>
            <Center>
              <TimekeepingsIllustration width={180} color={nextColor} />
            </Center>

            {(function () {
              if (prevTimekeeping.isFetching) return <Loading />;
              if (geolocation.isFetching) return <Loading message={t`Fetching location`} />;

              if (prevTimekeeping.error || !geolocation.data)
                return <Errored hideIcon error={prevTimekeeping.error || geolocation.error} />;

              if (!checkInLocation)
                return <Errored centered hideIcon error={t`Location not supported`} />;

              const prevType = prevTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
              const nextType =
                prevType === HrmTimekeepingType.CHECK_IN
                  ? HrmTimekeepingType.CHECK_OUT
                  : HrmTimekeepingType.CHECK_IN;

              return (
                <Fragment>
                  <Text ta="center" fw={500} fz={em(25)} c={color(nextColor)} tt="uppercase">
                    {nextType === HrmTimekeepingType.CHECK_IN ? t`Check in` : t`Check out`}
                  </Text>

                  <Stack gap={0}>
                    {prevTimekeeping.data &&
                      prevTimekeeping.data.type === HrmTimekeepingType.CHECK_IN && (
                        <Text ta="center" c="dark">
                          <Trans>
                            Checked in at{" "}
                            <strong>
                              <DateFormat value={prevTimekeeping.data.time} type="date" />
                            </strong>
                          </Trans>
                        </Text>
                      )}

                    {checkInLocation && (
                      <Text ta="center" c="dark">
                        {t`Location`} <strong>{checkInLocation.name}</strong>
                      </Text>
                    )}
                  </Stack>

                  {(function () {
                    if (geolocation.data && checkInLocation) {
                      if (file) {
                        return (
                          <Fragment>
                            <Card p={3} withBorder shadow="none">
                              <Center>
                                <Image src={URL.createObjectURL(file)} w={200} mah={200} />
                              </Center>
                            </Card>

                            <Group>
                              <Button
                                type="submit"
                                variant="outline"
                                color={nextColor}
                                rightSection={<IconCamera size={18} />}
                                onClick={onTakePhoto}
                                mt={10}
                              >
                                {t`Take photo again`}
                              </Button>

                              <Button
                                flex={1}
                                type="submit"
                                color={nextColor}
                                rightSection={<IconCheck size={18} />}
                                onClick={onLocation}
                                mt={10}
                              >
                                {t`Complete`}
                              </Button>
                            </Group>
                          </Fragment>
                        );
                      }

                      return (
                        <Center mt={16}>
                          <Button
                            type="submit"
                            onClick={onTakePhoto}
                            leftIcon={IconCameraSelfie}
                            color={nextColor}
                          >
                            <Trans>Take photo</Trans>
                          </Button>
                        </Center>
                      );
                    }

                    return (
                      <Fragment>
                        <Stack gap={10}>
                          <Errored error={geolocation.error} centered hideIcon />
                        </Stack>

                        <Center mt={10}>
                          <Button
                            onClick={() => geolocation.fetch({ isSilient: true })}
                            color={nextColor}
                          >
                            {t`Retry`}
                          </Button>
                        </Center>
                      </Fragment>
                    );
                  })()}
                </Fragment>
              );
            })()}

            <Anchor ta="center" c="gray" fz={em(13)} onClick={onClose}>
              {t`Leave`}
            </Anchor>
          </Stack>
        );
      }}
    </WithCamera>
  );
};

export const OnModalCaptureLocationTimekeeping = () =>
  modals.open({
    modalId: "ModalCaptureLocationTimekeeping",
    children: (
      <Stack p={16}>
        <ModalCaptureLocationTimekeeping />
      </Stack>
    ),
    withCloseButton: false,
    closeOnEscape: false,
    centered: true,
  });
