import { useInterval } from "@mantine/hooks";
import { MouseEventHandler, TouchEventHandler, useEffect, useState } from "react";

export const useLongPress = (callback: () => void, active = true, durationMs = 300) => {
  // * constants
  const STEP_MS = 50;

  // * local state
  const [progressValue, setProgressValue] = useState(0);

  const interval = useInterval(() => {
    setProgressValue((current) => {
      const stepPercentage = (STEP_MS / durationMs) * 100;
      return current + stepPercentage;
    });
  }, STEP_MS);

  // * for Desktop
  const onMouseDown: MouseEventHandler<any> = (_event) => {
    setProgressValue(0);
    interval.start();
  };
  const onMouseUp: MouseEventHandler<any> = (_event) => {
    interval.stop();
    if (!(progressValue >= 100)) setProgressValue(0);
  };
  const onMouseLeave: MouseEventHandler<any> = (_event) => {
    interval.stop();
    if (!(progressValue >= 100)) setProgressValue(0);
  };
  // * for Touch Device
  const onTouchStart: TouchEventHandler<any> = (_event) => {
    setProgressValue(0);
    interval.start();
  };
  const onTouchEnd: TouchEventHandler<any> = (_event) => {
    interval.stop();
    if (!(progressValue >= 100)) setProgressValue(0);
  };
  const onTouchCancel: TouchEventHandler<any> = (_event) => {
    interval.stop();
    if (!(progressValue >= 100)) setProgressValue(0);
  };

  useEffect(() => {
    if (progressValue >= 100 && active) {
      if (callback != null) callback();
    }
  }, [active, callback, progressValue]);

  return {
    progressValue,
    events: {
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
    }
  }
}