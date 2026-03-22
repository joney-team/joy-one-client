"use client";

import { ActionIcon } from "@/components/action-icon/action-icon";
import { Avatar } from "@/components/avatar";
import { Errored } from "@/components/errored";
import { DateFormat } from "@/components/format/date-format";
import { DateInput } from "@/components/inputs/date-input";
import { Modal } from "@/components/modal/modal";
import { useVariablesQuery } from "@/modules/apollo/use-query";
import { renderFileUrl } from "@/modules/files/files-utils";
import { type ModalFileGalleryRef } from "@/modules/files/modals/modal-file-gallery";
import { useWorkspaceMember } from "@/modules/workspace-members/hooks/use-workspace-member";
import { WorkspaceMemberRoleName } from "@/modules/workspace-roles/components/workspace-role-name";
import { nonLoading } from "@/utils/non-loading";
import { DateTime, type RawDate } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Card, Group, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarCheck, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { attendanceRecordTypes } from "../attendance-constants";
import QUERY_ATTENDANCE_RECORDS from "../graphql/queryAttendanceRecords.graphql";
import { getGoogleMapLinkCoord } from "@/modules/locations/locations-service";
import { sumAttendanceRecords } from "../attendance-utils";

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

  const {
    data,
    loading: isAttendanceLoading,
    error: attendanceError,
  } = useVariablesQuery(QUERY_ATTENDANCE_RECORDS, {
    query: {
      timeRangeTime: `date-${DateTime.toSeconds(selectedDate)}`,
      userId,
    },
  });

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

          return (
            <Card key={record._id} withBorder shadow="none" p="xs">
              <Group justify="space-between" gap="xs">
                <Group gap="xs">
                  <ThemeIcon color={color} size="lg">
                    <Icon size={18} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <DateFormat value={record.time} />

                    {record.locationCoordinates && (
                      <Anchor
                        href={getGoogleMapLinkCoord(record.locationCoordinates)}
                        target="_blank"
                        rel="noopener noreferrer"
                        fz="xs"
                      >
                        <Trans>View location</Trans>
                      </Anchor>
                    )}
                  </Stack>
                </Group>

                <Avatar
                  radius="sm"
                  className="clickable"
                  src={renderFileUrl(record.photoUrl)}
                  onClick={() => {
                    if (!record.photoUrl) return;
                    onViewPhotos(index);
                  }}
                />
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
