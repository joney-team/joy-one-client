import { useQuery } from "@apollo/client/react";
import { FC, Fragment } from "react";

import { Button } from "@/components/buttons/button";
import { NumberFormat } from "@/components/format/number-format";
import { Modal } from "@/components/modal/modal";
import { AttendanceRecordStatus, EventType } from "@/graphql/enums.graphql";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendarPause, IconClockCheck } from "@tabler/icons-react";
import { useEventsListener } from "../events/event-service";
import { AttendanceRecordCard } from "./attendance-record-card";
import GetAttendanceRecordsDocument from "./graphql/getAttendanceRecords.graphql";

export const PendingAttendanceList: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);

  const { data, refetch } = useQuery(GetAttendanceRecordsDocument, {
    variables: {
      query: {
        status: AttendanceRecordStatus.Pending,
      },
    },
  });

  useEventsListener(
    [EventType.AttendanceRecordNew],
    () => {
      if (opened) return;
      refetch();
    },
    [opened],
  );

  const records = data?.attendanceRecords.results ?? [];
  const total = data
    ? data?.attendanceRecords.total -
      records.filter((record) => record.status !== AttendanceRecordStatus.Pending).length
    : 0;

  if (records.length === 0) return null;

  return (
    <Fragment>
      {total > 0 && (
        <Button onClick={open} size="compact-sm" color="orange" leftIcon={IconCalendarPause}>
          <Trans>Pending requests</Trans> (<NumberFormat value={total} />)
        </Button>
      )}

      <Modal
        opened={opened}
        onClose={() => {
          close();
          refetch();
        }}
        name={<Trans>Pending requests</Trans>}
        icon={IconClockCheck}
      >
        <Stack gap="xs">
          {records.map((record) => (
            <AttendanceRecordCard key={record._id} record={record} />
          ))}
        </Stack>
      </Modal>
    </Fragment>
  );
};
