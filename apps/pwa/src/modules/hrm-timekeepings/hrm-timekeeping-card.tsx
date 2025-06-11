"use client";

import {
  HrmTimekeepingEntity,
  HrmTimekeepingMethod,
  HrmTimekeepingStatus,
  HrmTimekeepingType,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { Anchor, Badge, Card, Group, Stack, Text, ThemeIcon, em } from "@mantine/core";
import {
  IconArrowLeftFromArc,
  IconArrowLeftToArc,
  IconCameraSelfie,
  IconCheck,
  IconClock,
  IconLocation,
  IconNote,
  IconX,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Image } from "@/components/image";
import { getFiles } from "@/modules/files/file-service";
import { FileEntity } from "@/modules/files/file-types";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import {
  approveTimekeeping,
  rejectTimekeeping,
  removeTimekeeping,
} from "@/modules/hrm-timekeepings/hrm-timekeepings-service";
import { renderDateTime, t } from "@/modules/lang/lang-service";
import { UserCard } from "@/modules/users/user-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { StringUtils } from "@/utils/string.utils";
import { useList } from "@/utils/use-list.util";

interface HrmTimekeepingCardProps {
  timekeeping: HrmTimekeepingEntity;
}

export const HrmTimekeepingCard: FC<HrmTimekeepingCardProps> = (props) => {
  const { timekeeping } = props;
  const workspace = useWorkspace();

  const file = useList<FileEntity>({
    fetch: () => getFiles({ relatedHrmTimekeepingId: timekeeping._id, limit: 1 }),
  });

  return (
    <Card key={timekeeping._id} withBorder shadow="none" p={10}>
      <Stack gap={10}>
        <Group justify="space-between">
          <UserCard user={timekeeping.user} />

          <Group gap={10}>
            <Text fw={500} fz={em(13)}>
              {timekeeping.type === HrmTimekeepingType.CHECK_IN ? "Check-in" : "Check-out"}
            </Text>

            {(function () {
              if (timekeeping.type === HrmTimekeepingType.CHECK_IN) {
                return (
                  <ThemeIcon radius={100} color="primary">
                    <IconArrowLeftToArc size={18} />
                  </ThemeIcon>
                );
              }

              return (
                <ThemeIcon radius={100} color="orange">
                  <IconArrowLeftFromArc size={18} />
                </ThemeIcon>
              );
            })()}
          </Group>
        </Group>

        <Group justify="space-between">
          <Stack gap={5}>
            <Group gap={3}>
              <ThemeIcon color="dark" size="xs" variant="transparent">
                <IconClock size={18} />
              </ThemeIcon>
              <Group gap={5}>
                <Text fz={em(15)}>{renderDateTime(timekeeping.time, true)}</Text>
              </Group>
            </Group>

            {(function () {
              if (timekeeping.method === HrmTimekeepingMethod.LOCATION) {
                return (
                  timekeeping.locationName && (
                    <Group gap={3}>
                      <ThemeIcon color="dark" size="xs" variant="transparent">
                        <IconLocation size={16} />
                      </ThemeIcon>
                      <Text fz={em(15)}>{timekeeping.locationName}</Text>
                    </Group>
                  )
                );
              }
            })()}

            {timekeeping.note && (
              <Group gap={3}>
                <ThemeIcon color="dark" size="xs" variant="transparent">
                  <IconNote size={18} />
                </ThemeIcon>

                <Text
                  fz={em(15)}
                  dangerouslySetInnerHTML={{
                    __html: StringUtils.replaceLineBreaksToHTML(timekeeping.note),
                  }}
                />
              </Group>
            )}

            {timekeeping.status === HrmTimekeepingStatus.PENDING && (
              <Group gap={10} wrap="nowrap">
                {workspace.hasPermission(WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP) ? (
                  <Fragment>
                    <Button
                      radius={100}
                      leftIcon={IconCheck}
                      size="xs"
                      onClick={() => approveTimekeeping(timekeeping._id)}
                    >
                      {t("approve")}
                    </Button>

                    <Button
                      radius={100}
                      leftIcon={IconX}
                      variant="outline"
                      color="gray"
                      size="xs"
                      onClick={() => rejectTimekeeping(timekeeping._id, {})}
                    >
                      {t("reject")}
                    </Button>
                  </Fragment>
                ) : (
                  <Badge color="orange">{t("waiting_approval")}</Badge>
                )}
              </Group>
            )}
          </Stack>

          <Stack align="end">
            <Group gap={5} wrap="nowrap" align="start">
              {file.isEmpty && (
                <Card withBorder shadow="none" p={2} px={5}>
                  <Stack gap={2} align="center">
                    <ThemeIcon color="gray" size="xs" variant="transparent">
                      <IconCameraSelfie strokeWidth={1.5} size={18} />
                    </ThemeIcon>
                    <Text ta="center" fz={em(8)} c="gray">
                      {t("no_images")}
                    </Text>
                  </Stack>
                </Card>
              )}

              {file.isHasData && (
                <Anchor
                  c="dark"
                  fz={em(15)}
                  onClick={() => OnModalFileGallery({ files: [file.data[0]], disabled: true })}
                >
                  <Card withBorder shadow="none" p={2}>
                    <Stack gap={3}>
                      <Image src={file.data[0].url} w={50} h={50} mah={50} maw={50} bg="gray.8" />
                    </Stack>
                  </Card>
                </Anchor>
              )}
            </Group>
          </Stack>
        </Group>

        {timekeeping.status === HrmTimekeepingStatus.REJECTED && (
          <Badge color="red">{t("rejected")}</Badge>
        )}

        {workspace.hasPermission(WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP) &&
          timekeeping.status !== HrmTimekeepingStatus.PENDING && (
            <ButtonArchive name="timekeepings" process={() => removeTimekeeping(timekeeping._id)} />
          )}
      </Stack>
    </Card>
  );
};
