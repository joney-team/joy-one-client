import { Avatar } from "@/components/avatar";
import { DateFormat } from "@/components/format/date-format";
import { AttendanceRecordStatus } from "@/graphql/enums.graphql";
import { ModalConfirm, ModalConfirmRef } from "@/modals/modal-confirm";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Anchor, Badge, Card, Group, Menu, Stack, Text } from "@mantine/core";
import { IconCheck, IconClock, IconDotsVertical, IconLocation, IconX } from "@tabler/icons-react";
import { FC, useRef } from "react";
import { renderFileUrl } from "../files/files-utils";
import { getGoogleMapLinkCoord } from "../locations/locations-service";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "../workspaces/workspace-context";
import { attendanceRecordStatuses, attendanceRecordTypes } from "./attendance-constants";
import { AttendanceRecordFragment } from "./graphql/fragmentAttendanceRecord.graphql";

import MUTATION_APPROVE_ATTENDANCE_RECORD from "./graphql/mutationApproveAttendanceRecord.graphql";
import MUTATION_REJECT_ATTENDANCE_RECORD from "./graphql/mutationRejectAttendanceRecord.graphql";

export const AttendanceRecordCard: FC<{
  record: AttendanceRecordFragment;
  onViewPhotos?: () => void;
}> = ({ record, onViewPhotos }) => {
  const workspace = useWorkspace();
  const { t } = useLingui();
  const { icon: Icon, color } = attendanceRecordTypes[record.type];
  const { label, color: statusColor } = attendanceRecordStatuses[record.status];
  const modalConfirmRef = useRef<ModalConfirmRef>(null);

  const [approveAttendance] = useMutation(MUTATION_APPROVE_ATTENDANCE_RECORD);
  const [rejectAttendance] = useMutation(MUTATION_REJECT_ATTENDANCE_RECORD);

  return (
    <Card key={record._id} withBorder shadow="none" p="xs">
      <Group justify="space-between" gap="xs">
        <Group gap="xs">
          <Avatar
            radius="sm"
            size={65}
            className={onViewPhotos ? "clickable" : undefined}
            src={renderFileUrl(record.photoUrl)}
            onClick={() => {
              if (!record.photoUrl) return;
              onViewPhotos?.();
            }}
          />
          <Stack gap={5}>
            <Group gap="xs">
              <Badge tt="capitalize" color={color} leftSection={<Icon size={14} />} radius="lg">
                {t(attendanceRecordTypes[record.type].label)}
              </Badge>

              {(
                [
                  AttendanceRecordStatus.Rejected,
                  AttendanceRecordStatus.Pending,
                ] as AttendanceRecordStatus[]
              ).includes(record.status) && (
                <Badge color={statusColor} radius="lg" variant="light">
                  {t(label)}
                </Badge>
              )}
            </Group>

            <Text fz="xs">
              <IconClock size={14} style={{ marginBottom: -3, marginRight: 3 }} />
              <DateFormat value={record.time} />
            </Text>

            {record.locationCoordinates && (
              <Group>
                <Anchor
                  href={getGoogleMapLinkCoord(record.locationCoordinates)}
                  target="_blank"
                  rel="noopener noreferrer"
                  fz="xs"
                  c="dark"
                  truncate="end"
                  maw={300}
                >
                  <IconLocation size={14} style={{ marginBottom: -3, marginRight: 3 }} />

                  {record.location?.name ?? <Trans>View location</Trans>}
                </Anchor>
              </Group>
            )}
          </Stack>
        </Group>

        {workspace.hasPermission(WorkspacePermission.ATTENDANCE_RECORDS_MANAGER) && (
          <Group justify="end">
            <Menu>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {(
                  [
                    AttendanceRecordStatus.Pending,
                    AttendanceRecordStatus.Rejected,
                  ] as AttendanceRecordStatus[]
                ).includes(record.status) && (
                  <Menu.Item
                    leftSection={<IconCheck size={16} />}
                    onClick={() =>
                      approveAttendance({
                        variables: {
                          approveAttendanceRecordId: record._id,
                        },
                      })
                    }
                  >
                    <Trans>Approve</Trans>
                  </Menu.Item>
                )}

                {(
                  [
                    AttendanceRecordStatus.Approved,
                    AttendanceRecordStatus.Pending,
                  ] as AttendanceRecordStatus[]
                ).includes(record.status) && (
                  <Menu.Item
                    leftSection={<IconX size={16} />}
                    onClick={() =>
                      modalConfirmRef.current?.open({
                        onConfirm: () =>
                          rejectAttendance({
                            variables: {
                              rejectAttendanceRecordId: record._id,
                              input: {},
                            },
                          }),
                        content: (
                          <Trans>Are you sure you want to reject this attendance record?</Trans>
                        ),
                      })
                    }
                  >
                    <Trans>Reject</Trans>
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Group>

      <ModalConfirm ref={modalConfirmRef} />
    </Card>
  );
};
