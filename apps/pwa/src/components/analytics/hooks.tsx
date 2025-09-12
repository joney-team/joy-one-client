"use client";

import Clarity from "@microsoft/clarity";

export const useTracking = () => {
  return {
    trackEvent: (event: string, value?: Record<string, any>) => {
      console.debug(event, value);
      Clarity.event(event);
    },
  };
};
