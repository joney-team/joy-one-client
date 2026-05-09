"use client";

import config from "@joy-one/config";

export const getClarity = () => {
  return (window as any).clarity;
};

export const useTracking = () => {
  return {
    trackEvent: (event: string) => {
      if (!config.ANALYTICS_KEY) return null;
      const clarity = getClarity();
      if (clarity) clarity("event", event);
    },
  };
};
