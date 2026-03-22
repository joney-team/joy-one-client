import { AttendanceRecordStatus, AttendanceRecordType } from "@/graphql/enums.graphql";
import { type WorkspaceMemberDataFragment } from "../workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { type AttendanceRecordFragment } from "./graphql/fragmentAttendanceRecord.graphql";

export function sumAttendanceRecords(
  records: Pick<AttendanceRecordFragment, "time" | "userId" | "type" | "status">[],
): number {
  const pendingCheckInsByUser = new Map<string, number[]>();

  return Array.from(records)
    .sort((a, b) => a.time - b.time)
    .filter((record) => record.status === AttendanceRecordStatus.Approved)
    .reduce((acc, record) => {
      const { userId } = record;

      if (record.type === AttendanceRecordType.CheckIn) {
        const pendingCheckIns = pendingCheckInsByUser.get(userId) ?? [];
        pendingCheckIns.push(record.time);
        pendingCheckInsByUser.set(userId, pendingCheckIns);
        return acc;
      }

      if (record.type === AttendanceRecordType.CheckOut) {
        const pendingCheckIns = pendingCheckInsByUser.get(userId);
        const checkInTime = pendingCheckIns?.shift();

        if (checkInTime !== undefined && record.time > checkInTime) {
          const duration = record.time - checkInTime;
          acc += duration;
        }
      }

      return acc;
    }, 0);
}

export function groupAttendanceRecordsByUsers(records: AttendanceRecordFragment[]): {
  member: WorkspaceMemberDataFragment;
  records: AttendanceRecordFragment[];
}[] {
  const memberMap = new Map<
    string,
    {
      member: WorkspaceMemberDataFragment;
      records: AttendanceRecordFragment[];
    }
  >();

  records.forEach((record) => {
    if (record.member) {
      const memberId = record.member._id;
      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          member: record.member,
          records: [],
        });
      }
      memberMap.get(memberId)!.records.push(record);
    }
  });

  return Array.from(memberMap.values());
}
