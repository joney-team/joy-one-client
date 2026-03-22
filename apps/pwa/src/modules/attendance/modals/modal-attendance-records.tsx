"use client";

import { ActionIcon } from "@/components/action-icon/action-icon";
import { Avatar } from "@/components/avatar";
import { Errored } from "@/components/errored";
import { DateFormat } from "@/components/format/date-format";
import { DateInput } from "@/components/inputs/date-input";
import { Modal } from "@/components/modal/modal";
import { AttendanceRecordStatus, EventType } from "@/graphql/enums.graphql";
import { type ModalConfirmRef } from "@/modals/modal-confirm";
import { useVariablesQuery } from "@/modules/apollo/use-query";
import { useEventsListener } from "@/modules/events/event-service";
import { renderFileUrl } from "@/modules/files/files-utils";
import { type ModalFileGalleryRef } from "@/modules/files/modals/modal-file-gallery";
import { getGoogleMapLinkCoord } from "@/modules/locations/locations-service";
import { useWorkspaceMember } from "@/modules/workspace-members/hooks/use-workspace-member";
import { WorkspaceMemberRoleName } from "@/modules/workspace-roles/components/workspace-role-name";
import { nonLoading } from "@/utils/non-loading";
import { useMutation } from "@apollo/client/react";
import { DateTime, type RawDate } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Badge, Card, Group, Menu, Skeleton, Stack, Text } from "@mantine/core";
import {
  IconCalendarCheck,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconDotsVertical,
  IconLocation,
  IconX,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { attendanceRecordStatuses, attendanceRecordTypes } from "../attendance-constants";
import { sumAttendanceRecords } from "../attendance-utils";
import MUTATION_APPROVE_ATTENDANCE_RECORD from "../graphql/mutationApproveAttendanceRecord.graphql";
import MUTATION_REJECT_ATTENDANCE_RECORD from "../graphql/mutationRejectAttendanceRecord.graphql";
import QUERY_ATTENDANCE_RECORDS from "../graphql/queryAttendanceRecords.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";

const ModalConfirm = dynamic(
  () => import("@/modals/modal-confirm").then((mod) => mod.ModalConfirm),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalFileGallery = dynamic(
  () => import("@/modules/files/modals/modal-file-gallery").then((mod) => mod.ModalFileGallery),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export type ModalAttendanceRecordsState = {
  userId: string;
  date: RawDate;
};

export type ModalAttendanceRecordsRef = {
  open: (state: ModalAttendanceRecordsState) => void;
};

const AttendanceRecords: FC<ModalAttendanceRecordsState> = ({ userId, date }) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const [selectedDate, setSelectedDate] = useState(date);
  const { member, loading: isMemberLoading, error: memberError } = useWorkspaceMember(userId);
  const modalFileGalleryRef = useRef<ModalFileGalleryRef>(null);
  const modalConfirmRef = useRef<ModalConfirmRef>(null);

  const [approveAttendance] = useMutation(MUTATION_APPROVE_ATTENDANCE_RECORD);
  const [rejectAttendance] = useMutation(MUTATION_REJECT_ATTENDANCE_RECORD);

  const {
    data,
    loading: isAttendanceLoading,
    error: attendanceError,
    refetch,
  } = useVariablesQuery(QUERY_ATTENDANCE_RECORDS, {
    query: {
      timeRangeTime: `date-${DateTime.toSeconds(selectedDate)}`,
      userId,
    },
  });

  useEventsListener(
    [
      EventType.AttendanceRecordApproved,
      EventType.AttendanceRecordNew,
      EventType.AttendanceRecordRejected,
    ],
    () => refetch(),
  );

  const onViewPhotos = useCallback(
    (index: number) => {
      if (!data?.attendanceRecords.results) return;
      modalFileGalleryRef.current?.open({
        files: data.attendanceRecords.results
          .filter((record) => record.photoUrl)
          .map((record) => ({
            url: record.photoUrl!,
            fileName: `${t(attendanceRecordTypes[record.type].label)} - ${DateTime.format(record.time, { dateStyle: "short", timeStyle: "short" })}`,
          })),
        index,
      });
    },
    [data, t],
  );

  if (isMemberLoading) {
    return (
      <Stack p="sm">
        <Skeleton h={100} />
      </Stack>
    );
  }

  if (memberError || attendanceError || !member) {
    return (
      <Stack p="sm">
        <Errored error={memberError || attendanceError} />;
      </Stack>
    );
  }

  const records = Array.from(data?.attendanceRecords.results ?? []);
  const summary = sumAttendanceRecords(records);

  return (
    <Stack pt="sm" gap="xs">
      <Group mb="lg" justify="space-between">
        <Group px="sm" gap="xs">
          <Avatar user={member} />
          <Stack gap={0}>
            <Text>{member.name}</Text>
            <Text fz="xs">
              <WorkspaceMemberRoleName member={member} />
            </Text>
          </Stack>
        </Group>

        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="grey"
            radius={100}
            onClick={() => {
              setSelectedDate(DateTime.subtract(selectedDate, "date", 1));
            }}
          >
            <IconChevronLeft strokeWidth={1.5} />
          </ActionIcon>
          <DateInput
            value={selectedDate}
            clearable={false}
            autoFocus={false}
            onChange={(value) => {
              if (!value) return;
              setSelectedDate(value);
            }}
          />
          <ActionIcon
            variant="subtle"
            color="grey"
            radius={100}
            onClick={() => {
              setSelectedDate(DateTime.add(selectedDate, "date", 1));
            }}
          >
            <IconChevronRight strokeWidth={1.5} />
          </ActionIcon>
        </Group>
      </Group>

      {summary > 0 && (
        <Text c="dimmed" ta="center">
          <Trans>Total working time: {DateTime.toHHMM(summary)}</Trans>
        </Text>
      )}

      {records
        .sort((a, b) => a.time - b.time)
        .map((record, index) => {
          const { icon: Icon, color } = attendanceRecordTypes[record.type];
          const { label, color: statusColor } = attendanceRecordStatuses[record.status];

          return (
            <Card key={record._id} withBorder shadow="none" p="xs">
              <Group justify="space-between" gap="xs">
                <Group gap="xs">
                  <Avatar
                    radius="sm"
                    size={65}
                    className="clickable"
                    src={renderFileUrl(record.photoUrl)}
                    onClick={() => {
                      if (!record.photoUrl) return;
                      onViewPhotos(index);
                    }}
                  />
                  <Stack gap={5}>
                    <Group gap="xs">
                      <Badge
                        tt="capitalize"
                        color={color}
                        leftSection={<Icon size={14} />}
                        radius="lg"
                      >
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

                    <Group>
                      <Text fz="xs">
                        <IconClock size={14} style={{ marginBottom: -3, marginRight: 3 }} />
                        <DateFormat value={record.time} />
                      </Text>
                    </Group>

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
                                  <Trans>
                                    Are you sure you want to reject this attendance record?
                                  </Trans>
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
            </Card>
          );
        })}

      {!isAttendanceLoading && records.length === 0 && (
        <Text c="dimmed" ta="center">
          <Trans>No attendance records found</Trans>
        </Text>
      )}

      {isAttendanceLoading && (
        <Stack p="sm">
          <Skeleton h={100} />
        </Stack>
      )}

      <ModalFileGallery ref={modalFileGalleryRef} />
      <ModalConfirm ref={modalConfirmRef} />
    </Stack>
  );
};

export const ModalAttendanceRecords = forwardRef<ModalAttendanceRecordsRef, {}>((_, ref) => {
  const [state, setState] = useState<ModalAttendanceRecordsState | null>(null);

  const open = (state: ModalAttendanceRecordsState) => {
    setState(state);
  };

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <Modal
      icon={IconCalendarCheck}
      name={<Trans>Attendance records</Trans>}
      opened={!!state}
      onClose={() => setState(null)}
      size="lg"
    >
      {state && <AttendanceRecords userId={state.userId} date={state.date} />}
    </Modal>
  );
});
