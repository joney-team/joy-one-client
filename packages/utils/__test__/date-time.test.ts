import { describe, expect, it } from "vitest";
import { DateTime } from "../date-time";

describe("DateTime", () => {
  it("should normalize date", () => {
    expect(DateTime.normalizeDate(1719859200)).toEqual(new Date(1719859200000));
  });

  describe("isSame", () => {
    const baseDate = new Date(2024, 0, 15); // Jan 15, 2024

    it("should compare dates by day", () => {
      // Same day
      expect(DateTime.isSame(baseDate, new Date(2024, 0, 15), "day")).toBe(true);
      // Different day
      expect(DateTime.isSame(baseDate, new Date(2024, 0, 16), "day")).toBe(false);
      // Same day different month
      expect(DateTime.isSame(baseDate, new Date(2024, 1, 15), "day")).toBe(false);
      // Same day different year
      expect(DateTime.isSame(baseDate, new Date(2025, 0, 15), "day")).toBe(false);
    });

    it("should compare dates by week", () => {
      // Same week day (both Tuesday)
      expect(DateTime.isSame(baseDate, new Date(2024, 0, 15), "week")).toBe(true);
      // Different week day
      expect(DateTime.isSame(baseDate, new Date(2024, 0, 25), "week")).toBe(false);
      // Same week day different month
      expect(DateTime.isSame(baseDate, new Date(2024, 1, 15), "week")).toBe(false);
      // Same week day different year
      expect(DateTime.isSame(baseDate, new Date(2025, 0, 15), "week")).toBe(false);
    });

    it("should compare dates by month", () => {
      // Same month
      expect(DateTime.isSame(baseDate, new Date(2024, 0, 1), "month")).toBe(true);
      // Different month
      expect(DateTime.isSame(baseDate, new Date(2024, 1, 15), "month")).toBe(false);
      // Same month different year
      expect(DateTime.isSame(baseDate, new Date(2025, 0, 15), "month")).toBe(false);
    });

    it("should compare dates by year", () => {
      // Same year
      expect(DateTime.isSame(baseDate, new Date(2024, 11, 31), "year")).toBe(true);
      // Different year
      expect(DateTime.isSame(baseDate, new Date(2025, 0, 15), "year")).toBe(false);
    });

    it("should handle different date formats", () => {
      // Test with timestamp in seconds
      expect(DateTime.isSame(baseDate, 1705251600, "day")).toBe(true); // Jan 15, 2024 00:00:00 UTC
      // Test with ISO string
      expect(DateTime.isSame(baseDate, "2024-01-15T00:00:00.000Z", "day")).toBe(true);
    });

    it("should throw error for invalid unit", () => {
      // @ts-expect-error Testing invalid unit
      expect(() => DateTime.isSame(baseDate, new Date(), "invalid")).toThrow(
        "Unit invalid is not supported"
      );
    });
  });

  describe("diff", () => {
    const baseDate = new Date(2024, 0, 15, 12, 30, 45); // Jan 15, 2024, 12:30:45

    it("should calculate difference in seconds", () => {
      // Same second
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 12, 30, 45), "second")).toBe(0);
      // One second difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 12, 30, 46), "second")).toBe(1);
      // One minute difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 12, 31, 45), "second")).toBe(60);
      // One hour difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 13, 30, 45), "second")).toBe(3600);
    });

    it("should calculate difference in minutes", () => {
      // Same minute
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 12, 30, 0), "minute")).toBe(0);
      // One minute difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 12, 31, 45), "minute")).toBe(1);
      // One hour difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 13, 30, 45), "minute")).toBe(60);
      // Multiple hours difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 14, 30, 45), "minute")).toBe(120);
    });

    it("should calculate difference in hours", () => {
      // Same hour
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 12, 0, 0), "hour")).toBe(0);
      // One hour difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15, 13, 30, 45), "hour")).toBe(1);
      // One day difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 16, 12, 30, 45), "hour")).toBe(24);
      // Multiple days difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 17, 12, 30, 45), "hour")).toBe(48);
    });

    it("should calculate difference in days", () => {
      // Same day
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15), "day")).toBe(0);
      // One day difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 16), "day")).toBe(1);
      // One month difference
      expect(DateTime.diff(baseDate, new Date(2024, 1, 15), "day")).toBe(31);
      // One year difference
      expect(DateTime.diff(baseDate, new Date(2025, 0, 15), "day")).toBe(366); // 2024 is a leap year
    });

    it("should calculate difference in weeks", () => {
      // Same week
      expect(DateTime.diff(baseDate, new Date(2024, 0, 15), "week")).toBe(0);
      // One week difference
      expect(DateTime.diff(baseDate, new Date(2024, 0, 22), "week")).toBe(1);
      // Four weeks difference
      expect(DateTime.diff(baseDate, new Date(2024, 1, 12), "week")).toBe(4);
    });

    it("should calculate difference in months", () => {
      // Same month
      expect(DateTime.diff(baseDate, new Date(2024, 0, 1), "month")).toBe(0);
      // One month difference
      expect(DateTime.diff(baseDate, new Date(2024, 1, 15), "month")).toBe(1);
      // One year difference
      expect(DateTime.diff(baseDate, new Date(2025, 0, 15), "month")).toBe(12);
      // One year and 3 months difference
      expect(DateTime.diff(baseDate, new Date(2025, 3, 15), "month")).toBe(15);
    });

    it("should calculate difference in years", () => {
      // Same year
      expect(DateTime.diff(baseDate, new Date(2024, 11, 31), "year")).toBe(0);
      // One year difference
      expect(DateTime.diff(baseDate, new Date(2025, 0, 15), "year")).toBe(1);
      // Multiple years difference
      expect(DateTime.diff(baseDate, new Date(2026, 0, 15), "year")).toBe(2);
    });

    it("should handle different date formats", () => {
      // Test with timestamp in seconds
      expect(DateTime.diff(baseDate, 1705251600, "day")).toBe(0); // Jan 15, 2024 00:00:00 UTC
      // Test with ISO string
      expect(DateTime.diff(baseDate, "2024-01-15T00:00:00.000Z", "day")).toBe(0);
    });

    it("should throw error for invalid unit", () => {
      // @ts-expect-error Testing invalid unit
      expect(() => DateTime.diff(baseDate, new Date(), "invalid")).toThrow(
        "Unit invalid is not supported"
      );
    });
  });

  describe("add", () => {
    const baseDate = new Date(2024, 0, 15, 12, 30, 45); // Jan 15, 2024, 12:30:45

    it("should add seconds", () => {
      // Add 1 second
      expect(DateTime.add(baseDate, "second", 1)).toEqual(new Date(2024, 0, 15, 12, 30, 46));
      // Add 30 seconds
      expect(DateTime.add(baseDate, "second", 30)).toEqual(new Date(2024, 0, 15, 12, 31, 15));
      // Add 60 seconds (1 minute)
      expect(DateTime.add(baseDate, "second", 60)).toEqual(new Date(2024, 0, 15, 12, 31, 45));
      // Add negative seconds
      expect(DateTime.add(baseDate, "second", -30)).toEqual(new Date(2024, 0, 15, 12, 30, 15));
    });

    it("should add minutes", () => {
      // Add 1 minute
      expect(DateTime.add(baseDate, "minute", 1)).toEqual(new Date(2024, 0, 15, 12, 31, 45));
      // Add 30 minutes
      expect(DateTime.add(baseDate, "minute", 30)).toEqual(new Date(2024, 0, 15, 13, 0, 45));
      // Add 60 minutes (1 hour)
      expect(DateTime.add(baseDate, "minute", 60)).toEqual(new Date(2024, 0, 15, 13, 30, 45));
      // Add negative minutes
      expect(DateTime.add(baseDate, "minute", -30)).toEqual(new Date(2024, 0, 15, 12, 0, 45));
    });

    it("should add hours", () => {
      // Add 1 hour
      expect(DateTime.add(baseDate, "hour", 1)).toEqual(new Date(2024, 0, 15, 13, 30, 45));
      // Add 12 hours
      expect(DateTime.add(baseDate, "hour", 12)).toEqual(new Date(2024, 0, 16, 0, 30, 45));
      // Add 24 hours (1 day)
      expect(DateTime.add(baseDate, "hour", 24)).toEqual(new Date(2024, 0, 16, 12, 30, 45));
      // Add negative hours
      expect(DateTime.add(baseDate, "hour", -12)).toEqual(new Date(2024, 0, 15, 0, 30, 45));
    });

    it("should add days", () => {
      // Add 1 day
      expect(DateTime.add(baseDate, "day", 1)).toEqual(new Date(2024, 0, 16, 12, 30, 45));
      // Add 7 days (1 week)
      expect(DateTime.add(baseDate, "day", 7)).toEqual(new Date(2024, 0, 22, 12, 30, 45));
      // Add 31 days (1 month)
      expect(DateTime.add(baseDate, "day", 31)).toEqual(new Date(2024, 1, 15, 12, 30, 45));
      // Add negative days
      expect(DateTime.add(baseDate, "day", -1)).toEqual(new Date(2024, 0, 14, 12, 30, 45));
    });

    it("should add weeks", () => {
      // Add 1 week
      expect(DateTime.add(baseDate, "week", 1)).toEqual(new Date(2024, 0, 22, 12, 30, 45));
      // Add 2 weeks
      expect(DateTime.add(baseDate, "week", 2)).toEqual(new Date(2024, 0, 29, 12, 30, 45));
      // Add 4 weeks
      expect(DateTime.add(baseDate, "week", 4)).toEqual(new Date(2024, 1, 12, 12, 30, 45));
      // Add negative weeks
      expect(DateTime.add(baseDate, "week", -1)).toEqual(new Date(2024, 0, 8, 12, 30, 45));
    });

    it("should add months", () => {
      // Add 1 month
      expect(DateTime.add(baseDate, "month", 1)).toEqual(new Date(2024, 1, 15, 12, 30, 45));
      // Add 3 months
      expect(DateTime.add(baseDate, "month", 3)).toEqual(new Date(2024, 3, 15, 12, 30, 45));
      // Add 12 months (1 year)
      expect(DateTime.add(baseDate, "month", 12)).toEqual(new Date(2025, 0, 15, 12, 30, 45));
      // Add negative months
      expect(DateTime.add(baseDate, "month", -1)).toEqual(new Date(2023, 11, 15, 12, 30, 45));
    });

    it("should add years", () => {
      // Add 1 year
      expect(DateTime.add(baseDate, "year", 1)).toEqual(new Date(2025, 0, 15, 12, 30, 45));
      // Add 2 years
      expect(DateTime.add(baseDate, "year", 2)).toEqual(new Date(2026, 0, 15, 12, 30, 45));
      // Add 10 years
      expect(DateTime.add(baseDate, "year", 10)).toEqual(new Date(2034, 0, 15, 12, 30, 45));
      // Add negative years
      expect(DateTime.add(baseDate, "year", -1)).toEqual(new Date(2023, 0, 15, 12, 30, 45));
    });

    it("should handle different date formats", () => {
      // Test with timestamp in seconds
      expect(DateTime.add(1705251600, "day", 1)).toEqual(new Date(2024, 0, 16, 0, 0, 0)); // Jan 16, 2024 00:00:00 UTC
      // Test with ISO string (UTC time)
      expect(DateTime.add("2024-01-15T12:30:45.000Z", "hour", 1)).toEqual(
        new Date("2024-01-15T13:30:45.000Z")
      );
    });

    it("should throw error for invalid unit", () => {
      // @ts-expect-error Testing invalid unit
      expect(() => DateTime.add(baseDate, "invalid", 1)).toThrow("Unit invalid is not supported");
    });

    it("should handle case insensitive units", () => {
      // Test uppercase units
      expect(DateTime.add(baseDate, "day", 1)).toEqual(new Date(2024, 0, 16, 12, 30, 45));
      expect(DateTime.add(baseDate, "hour", 1)).toEqual(new Date(2024, 0, 15, 13, 30, 45));
      expect(DateTime.add(baseDate, "month", 1)).toEqual(new Date(2024, 1, 15, 12, 30, 45));

      // Test mixed case units
      expect(DateTime.add(baseDate, "day", 1)).toEqual(new Date(2024, 0, 16, 12, 30, 45));
      expect(DateTime.add(baseDate, "hour", 1)).toEqual(new Date(2024, 0, 15, 13, 30, 45));
    });
  });
});
