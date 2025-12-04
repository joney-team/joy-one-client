"use client";

import { createContext, FC, PropsWithChildren, RefObject, useContext, useRef } from "react";

interface GanttRefs {
  sidebarContainer: RefObject<HTMLDivElement>;
  bodyContainer: RefObject<HTMLDivElement>;
  body: RefObject<HTMLDivElement>;
}

const Context = createContext({} as GanttRefs);

export const GanttRefsProvider: FC<PropsWithChildren> = ({ children }) => {
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null);
  const bodyContainerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  return (
    <Context.Provider
      value={{
        sidebarContainer: sidebarContainerRef as RefObject<HTMLDivElement>,
        bodyContainer: bodyContainerRef as RefObject<HTMLDivElement>,
        body: bodyRef as RefObject<HTMLDivElement>,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useGanttRefs = () => useContext(Context);
