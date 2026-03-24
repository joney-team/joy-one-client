"use client";

import { ActionIcon } from "@/components/action-icon/action-icon";
import { Avatar } from "@/components/avatar";
import { Errored } from "@/components/errored";
import { DateInput } from "@/components/inputs/date-input";
import { Modal } from "@/components/modal/modal";
import { EventType } from "@/graphql/enums.graphql";
import { type ModalConfirmRef } from "@/modals/modal-confirm";
import { useVariablesQuery } from "@/modules/apollo/use-query";
import { useEventsListener } from "@/modules/events/event-service";
import { type ModalFileGalleryRef } from "@/modules/files/modals/modal-file-gallery";
import { useWorkspaceMember } from "@/modules/workspace-members/hooks/use-workspace-member";
import { WorkspaceMemberRoleName } from "@/modules/workspace-roles/components/workspace-role-name";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { DateTime, type RawDate } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Group, Skeleton, Stack, Text } from "@mantine/core";
import { IconCalendarCheck, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { attendanceRecordTypes } from "../attendance-constants";
import { AttendanceRecordCard } from "../attendance-record-card";
import { getWorkingDurationTime } from "../attendance-utils";
import QUERY_ATTENDANCE_RECORDS from "../graphql/queryAttendanceRecords.graphql";
import { useQuery } from "@apollo/client/react";

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
  const [selectedDate, setSelectedDate] = useState(date);
  const { member, loading: isMemberLoading, error: memberError } = useWorkspaceMember(userId);
  const modalFileGalleryRef = useRef<ModalFileGalleryRef>(null);
  const modalConfirmRef = useRef<ModalConfirmRef>(null);

  const {
    data,
    loading: isAttendanceLoading,
    error: attendanceError,
    refetch,
  } = useQuery(QUERY_ATTENDANCE_RECORDS, {
    variables: {
      query: {
        timeRangeTime: `date-${DateTime.toSeconds(selectedDate)}`,
        userId,
      },
    },
  });

  useEventsListener([EventType.AttendanceRecordNew], () => refetch());

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
  const summary = getWorkingDurationTime(records);

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
        .map((record, index) => (
          <AttendanceRecordCard
            key={record._id}
            record={record}
            onViewPhotos={() => onViewPhotos(index)}
          />
        ))}

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
