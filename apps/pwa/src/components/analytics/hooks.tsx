"use client";

import { useAptabase } from "@aptabase/react";

export const useTracking = () => {
  const { trackEvent } = useAptabase();

  return {
    trackEvent: (event: string, data?: Record<string, any>) => {
      trackEvent(event, data);
    },
  };
};
