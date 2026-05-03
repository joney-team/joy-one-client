"use client";

export interface Global extends Window {
  FB: any;
}

let serverGlobal = {} as Global;

export const getGlobal = (): Global => {
  if (typeof window === "undefined") return serverGlobal;
  return window as unknown as Global;
};
