"use client";

import { Button } from "@/components/buttons/button";
import { useCamera } from "@/components/camera";
import { Errored } from "@/components/errored";
import { TimekeepingsIllustration } from "@/components/illustrations/timekeepings";
import { Image } from "@/components/image";
import { Loading } from "@/components/loading";
import { onUploadFile } from "@/modules/files/file-service";
import {
  captureLocationTimekeeping,
  getPreviousTimeKeeping,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import {
  HrmTimekeepingEntity,
  HrmTimekeepingStatus,
  HrmTimekeepingType,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { renderDateTime, t } from "@/modules/lang/lang-service";
import { findAvailableLocationToCheckIn, getGeolocation } from "@/modules/locations/locations-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { Anchor, Card, Center, Group, Stack, Text, em } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCamera, IconCameraSelfie, IconCheck } from "@tabler/icons-react";
import { FC, useState } from "react";

export const ModalCaptureLocationTimekeeping: FC = () => {
  const workspace = useWorkspace();
  const camera = useCamera();
  const color = useColor();

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
      if (!checkInLocation || !geolocation.data || !file) throw Error(t("hrm_timekeepings_not_enough_condition"));

      const coordinates = {
        lat: geolocation.data.coords.latitude,
        lng: geolocation.data.coords.longitude,
      };

      const timekeeping = await captureLocationTimekeeping({ coordinates });

      await onUploadFile({
        file,
        compressSize: 1,
        relatedHrmTimekeepingId: timekeeping._id,
      });

      setTimekeeping(timekeeping);
      setTimeout(onClose, 3000);
    } catch (error) {
      onError(error);
    }
  };

  if (timekeeping) {
    const timekeepingColor = timekeeping.type === HrmTimekeepingType.CHECK_IN ? "primary" : "orange";

    return (
      <Stack align="stretch" justify="center" gap={16} pt={16}>
        <Center>
          <TimekeepingsIllustration width={180} color={timekeepingColor} />
        </Center>

        <Text ta="center" c={color(timekeepingColor)} fw={500} fz={em(22)}>
          {timekeeping.type === HrmTimekeepingType.CHECK_IN
            ? t("hrm_timekeepings_check_in_success")
            : t("hrm_timekeepings_check_out_success")}
        </Text>

        {timekeeping.status === HrmTimekeepingStatus.PENDING ? (
          <Text ta="center">{t("hrm_timekeepings_pending_approval")}</Text>
        ) : (
          <>
            {timekeeping.type === HrmTimekeepingType.CHECK_IN ? (
              <Text ta="center" c="dark">
                {t("hrm_timekeepings_complete_msg", { name: workspace.userMember.name })}
              </Text>
            ) : (
              <Text ta="center" c="dark">
                {t("hrm_timekeepings_complete_msg_out", { name: workspace.userMember.name })}
              </Text>
            )}
          </>
        )}

        <Anchor ta="center" c="gray" fz={em(13)} onClick={onClose}>
          {t("leave")}
        </Anchor>
      </Stack>
    );
  }

  const prevType = prevTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
  const nextType =
    prevType === HrmTimekeepingType.CHECK_IN ? HrmTimekeepingType.CHECK_OUT : HrmTimekeepingType.CHECK_IN;
  const nextColor = nextType === HrmTimekeepingType.CHECK_IN ? "primary" : "orange";

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
        if (geolocation.isFetching) return <Loading message={t("fetching_location")} />;

        if (prevTimekeeping.error || !geolocation.data)
          return (
            <>
              <Errored hideIcon error={prevTimekeeping.error || geolocation.error} />
            </>
          );

        if (!checkInLocation)
          return (
            <>
              <Errored centered hideIcon error={t("hrm_timekeepings_location_not_supported")} />
            </>
          );

        const prevType = prevTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
        const nextType =
          prevType === HrmTimekeepingType.CHECK_IN ? HrmTimekeepingType.CHECK_OUT : HrmTimekeepingType.CHECK_IN;

        return (
          <>
            <Text ta="center" fw={500} fz={em(25)} c={color(nextColor)} tt="uppercase">
              {nextType === HrmTimekeepingType.CHECK_IN
                ? t("hrm_timekeepings_check_in")
                : t("hrm_timekeepings_check_out")}
            </Text>

            <Stack gap={0}>
              {prevTimekeeping.data && prevTimekeeping.data.type === HrmTimekeepingType.CHECK_IN && (
                <Text ta="center" c="dark">
                  {t("hrm_timekeepings_checked_in_at")} <strong>{renderDateTime(prevTimekeeping.data.time)}</strong>
                </Text>
              )}

              {checkInLocation && (
                <Text ta="center" c="dark">
                  {t("location")} <strong>{checkInLocation.name}</strong>
                </Text>
              )}
            </Stack>

            {(function () {
              if (geolocation.data && checkInLocation) {
                if (file) {
                  return (
                    <>
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
                          {t("take_photo_again")}
                        </Button>

                        <Button
                          flex={1}
                          type="submit"
                          color={nextColor}
                          rightSection={<IconCheck size={18} />}
                          onClick={onLocation}
                          mt={10}
                        >
                          {t("complete")}
                        </Button>
                      </Group>
                    </>
                  );
                }

                return (
                  <Center mt={16}>
                    <Button action type="submit" onClick={onTakePhoto} leftIcon={IconCameraSelfie} color={nextColor}>
                      {t("take_photo")}
                    </Button>
                  </Center>
                );
              }

              return (
                <>
                  <Stack gap={10}>
                    <Errored error={geolocation.error} centered hideIcon />
                  </Stack>

                  <Center mt={10}>
                    <Button onClick={() => geolocation.fetch({ isSilient: true })} color={nextColor}>
                      {t("retry")}
                    </Button>
                  </Center>
                </>
              );
            })()}
          </>
        );
      })()}

      <Anchor ta="center" c="gray" fz={em(13)} onClick={onClose}>
        {t("leave")}
      </Anchor>
    </Stack>
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
