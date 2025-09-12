"use client";

export const getClarity = () => {
  return (window as any).clarity;
};

export const useTracking = () => {
  return {
    trackEvent: (event: string) => {
      const clarity = getClarity();
      if (clarity) clarity("event", event);
    },
  };
};
