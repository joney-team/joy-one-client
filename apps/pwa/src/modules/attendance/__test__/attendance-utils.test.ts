import { describe, it, expect } from "vitest";
import { sumAttendanceRecords } from "../attendance-utils";
import { AttendanceRecordStatus, AttendanceRecordType } from "@/graphql/enums.graphql";

describe("sumAttendanceRecords", () => {
  it("should return 0 for empty records", () => {
    const result = sumAttendanceRecords([]);
    expect(result).toBe(0);
  });

  it("should calculate duration for a single check-in/check-out pair", () => {
    const records = [
      {
        userId: "user1",
        type: AttendanceRecordType.CheckIn,
        time: 1773799200,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user1",
        type: AttendanceRecordType.CheckOut,
        time: 1773810000,
        status: AttendanceRecordStatus.Approved,
      },
    ];
    const result = sumAttendanceRecords(records);
    expect(result).toBe(10800);
  });

  it("should handle multiple check-in/check-out pairs for same user", () => {
    const records = [
      {
        userId: "user1",
        type: AttendanceRecordType.CheckIn,
        time: 1000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user1",
        type: AttendanceRecordType.CheckOut,
        time: 2000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user1",
        type: AttendanceRecordType.CheckIn,
        time: 3000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user1",
        type: AttendanceRecordType.CheckOut,
        time: 5000,
        status: AttendanceRecordStatus.Approved,
      },
    ];
    const result = sumAttendanceRecords(records);
    expect(result).toBe(1000 + 2000);
  });

  it("should handle multiple users with separate sessions", () => {
    const records = [
      {
        userId: "user1",
        type: AttendanceRecordType.CheckIn,
        time: 1000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user1",
        type: AttendanceRecordType.CheckOut,
        time: 2000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user2",
        type: AttendanceRecordType.CheckIn,
        time: 3000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user2",
        type: AttendanceRecordType.CheckOut,
        time: 5000,
        status: AttendanceRecordStatus.Approved,
      },
    ];
    const result = sumAttendanceRecords(records);
    expect(result).toBe(1000 + 2000);
  });

  it("should ignore check-out without preceding check-in", () => {
    const records = [
      {
        userId: "user1",
        type: AttendanceRecordType.CheckOut,
        time: 2000,
        status: AttendanceRecordStatus.Approved,
      },
    ];
    const result = sumAttendanceRecords(records);
    expect(result).toBe(0);
  });

  it("should ignore check-in without check-out", () => {
    const records = [
      {
        userId: "user1",
        type: AttendanceRecordType.CheckIn,
        time: 1000,
        status: AttendanceRecordStatus.Approved,
      },
    ];
    const result = sumAttendanceRecords(records);
    expect(result).toBe(0);
  });

  it("should ignore check-out with earlier time than check-in", () => {
    const records = [
      {
        userId: "user1",
        type: AttendanceRecordType.CheckIn,
        time: 5000,
        status: AttendanceRecordStatus.Approved,
      },
      {
        userId: "user1",
        type: AttendanceRecordType.CheckOut,
        time: 2000,
        status: AttendanceRecordStatus.Approved,
      },
    ];
    const result = sumAttendanceRecords(records);
    expect(result).toBe(0);
  });
});
