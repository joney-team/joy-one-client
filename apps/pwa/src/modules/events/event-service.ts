"use client";

import { ResponseList } from "@/types";
import EventEmitter from "events";
import { DependencyList, useEffect } from "react";
import { api, socket } from "../apis";
import { EventEntity, QueryEvents, UserEventDto } from "./event-types";
import { useAuth } from "../auth/auth-context";
import { EventType } from "@/graphql/types.graphql";

export const eventsEmitter = new EventEmitter();
eventsEmitter.setMaxListeners(500);

export const addEventsListener = (type: EventType, listener: (...args: any[]) => void) => {
  eventsEmitter.addListener(type, listener);
};

export const removeEventsListner = (type: EventType, listener: (...args: any[]) => void) => {
  eventsEmitter.removeListener(type, listener);
};

export const useEventsListener = (
  type: EventType | EventType[],
  listener: (event: EventEntity) => void,
  deps?: DependencyList
) => {
  useEffect(() => {
    if (!type || (Array.isArray(type) && type.length === 0)) return () => {};

    if (Array.isArray(type)) {
      type.forEach((t) => addEventsListener(t, listener));

      return () => {
        type.forEach((t) => removeEventsListner(t, listener));
      };
    } else {
      addEventsListener(type, listener);

      return () => {
        removeEventsListner(type, listener);
      };
    }
  }, [...(deps || []), ...(Array.isArray(type) ? type : [type])]);
};

export const usePureEventsListner = (
  listener: (event: EventEntity) => void,
  deps?: DependencyList
) => {
  useEffect(() => {
    socket.on("EVENT_NEW", listener);

    return () => {
      socket.removeListener("EVENT_NEW", listener);
    };
  }, deps || []);
};

export const useUserEventsListner = (
  listener: (event: UserEventDto) => void,
  deps?: DependencyList
) => {
  const auth = useAuth();

  useEffect(() => {
    socket.on("USER_EVENT", listener);

    return () => {
      socket.removeListener("USER_EVENT", listener);
    };
  }, [auth.user?._id, ...(deps || [])]);
};

export function getEvents(query?: QueryEvents): Promise<ResponseList<EventEntity>> {
  return api.get(`/events`, { params: query });
}

export const onReconnected = (listener: () => void, deps?: DependencyList) => {
  useEffect(() => {
    socket.io.on("reconnect", listener);

    return () => {
      socket.io.removeListener("reconnect", listener);
    };
  }, deps || []);
};
