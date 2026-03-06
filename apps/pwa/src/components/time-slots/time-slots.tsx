"use client";

import { FC, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from "./time-slots.module.css";
import { TimeSlotsContextValue, TimeSlotsProps } from "./time-slots.types";
import { displayHour, getMinutesFromStringTime, groupOverlappingEvents } from "./time-slots.utils";

import { classNames } from "@/utils/ui.utils";
import { HOURS, TIME_SLOTS_CONFIG, TimeSlotsContext } from "./time-slots.constants";
import { TimeSlotsEvent } from "./time-slots.event";
import { TimeSlotsSelecting } from "./time-slots.selecting";

export const TimeSlots: FC<TimeSlotsProps> = ({
  cols,
  events = [],
  stepInMinutes = 15,
  onSelect,
  onEventClick,
  onEventResize,
  availableTimeIntervals,
  isAllowUnavailableTimeIntervals = false,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [contextValue, setContextValue] = useState<
    Pick<TimeSlotsContextValue, "rootRect" | "headRect">
  >({
    rootRect: { width: 0, height: 0, x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 0 },
    headRect: { width: 0, height: 0, x: 0, y: 0, bottom: 0, left: 0, right: 0, top: 0 },
  });

  const syncUiState = useCallback(() => {
    if (!rootRef.current || !headRef.current) return;

    setContextValue({
      rootRect: rootRef.current.getBoundingClientRect(),
      headRect: headRef.current.getBoundingClientRect(),
    });
  }, [rootRef.current, headRef.current]);

  useEffect(() => {
    if (rootRef.current) {
      syncUiState();

      const observer = new ResizeObserver(syncUiState);
      observer.observe(rootRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [syncUiState]);

  const columnWidth = useMemo(() => {
    return (contextValue.rootRect.width - TIME_SLOTS_CONFIG.hourColumnWidth) / cols.length;
  }, [contextValue.rootRect.width, cols.length]);

  const isReady = useMemo(() => {
    return columnWidth > 0;
  }, [columnWidth, cols]);

  const isHasRestrictedTimeIntervals = useMemo(() => {
    return availableTimeIntervals && availableTimeIntervals?.length > 0;
  }, [availableTimeIntervals]);

  return (
    <TimeSlotsContext.Provider
      value={{
        ...contextValue,
        rootRef,
        headRef,
        columnWidth,
        stepInMinutes,
        onSelect,
        cols,
        onEventClick,
        onEventResize,
        availableTimeIntervals,
        isAllowUnavailableTimeIntervals,
      }}
    >
      <div
        className={classNames(styles.TimeSlots, {
          [styles.isHasRestrictedTimeIntervals]: isHasRestrictedTimeIntervals,
        })}
        ref={rootRef}
      >
        {isHasRestrictedTimeIntervals && (
          <Fragment>
            <div
              className={styles.InvalidArea}
              style={{
                width: contextValue.rootRect.width - TIME_SLOTS_CONFIG.hourColumnWidth,
                height: contextValue.rootRect.height - contextValue.headRect.height,
                top: contextValue.headRect.height,
                left: TIME_SLOTS_CONFIG.hourColumnWidth,
              }}
            />

            {(availableTimeIntervals ?? []).map((interval, intervalIndex) => {
              const startInMinutes = getMinutesFromStringTime(interval.start);
              const endInMinutes = getMinutesFromStringTime(interval.end);

              if (startInMinutes === null || endInMinutes === null) return null;

              const width = columnWidth;
              const top =
                contextValue.headRect.height +
                (startInMinutes / 60) * TIME_SLOTS_CONFIG.hourCellHeight;

              const right = (cols.length - interval.columnIndex - 1) * columnWidth;
              const height =
                ((endInMinutes - startInMinutes) / 60) * TIME_SLOTS_CONFIG.hourCellHeight;

              return (
                <div
                  key={interval.start + interval.end + intervalIndex}
                  className={styles.AvailableTimeInterval}
                  style={{
                    top,
                    right,
                    width,
                    height,
                  }}
                />
              );
            })}
          </Fragment>
        )}

        <div className={classNames(styles.Row, styles.isSticky)} ref={headRef}>
          <div
            className={classNames(styles.Cell, styles.Head)}
            style={{ width: TIME_SLOTS_CONFIG.hourColumnWidth }}
          />

          {cols.map((col, colIndex) => (
            <div key={colIndex} className={classNames(styles.Cell, styles.Head)}>
              {col.head}
            </div>
          ))}
        </div>

        {HOURS.map((hour) => {
          return (
            <div
              key={hour}
              className={styles.Row}
              style={{ height: TIME_SLOTS_CONFIG.hourCellHeight }}
            >
              <div
                className={classNames(styles.Cell, styles.Hour)}
                style={{ width: TIME_SLOTS_CONFIG.hourColumnWidth }}
              >
                {displayHour(hour)}
              </div>

              {cols.map((_, colIndex) => (
                <div key={colIndex} className={classNames(styles.Cell, styles.Slot)} />
              ))}
            </div>
          );
        })}

        {isReady && (
          <Fragment>
            <TimeSlotsSelecting />

            {events.length > 0 &&
              cols.map((_, colIndex) => {
                const colSlots = events.filter((s) => s.columnIndex === colIndex);
                if (colSlots.length === 0) return null;

                const groupByOverlap = groupOverlappingEvents(colSlots);

                return groupByOverlap.map((group) =>
                  group.map((event, eventIndex) => (
                    <TimeSlotsEvent
                      key={event.id + event.start + event.end + colSlots.length}
                      event={event}
                      index={eventIndex}
                    />
                  ))
                );
              })}
          </Fragment>
        )}
      </div>
    </TimeSlotsContext.Provider>
  );
};
