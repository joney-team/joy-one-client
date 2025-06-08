import { ResponseList } from "@/types";
import EventEmitter from "events";
import { DependencyList, useEffect } from "react";
import { socket } from "../apis";
import { MainRequest } from "../requests/main.request";
import { EventEntity, EventType, QueryEvents, UserEventDto } from "./event-types";

export const eventsEmitter = new EventEmitter();
eventsEmitter.setMaxListeners(500);

export const addEventsListener = (type: EventType, listener: (...args: any[]) => void) => {
  eventsEmitter.addListener(type, listener);
}

export const removeEventsListner = (type: EventType, listener: (...args: any[]) => void) => {
  eventsEmitter.removeListener(type, listener);
}

export const useEventsListener = (type: EventType | EventType[], listener: (event: EventEntity) => void, deps?: DependencyList) => {
  useEffect(() => {
    if (!type || (Array.isArray(type) && type.length === 0)) return () => { };

    if (Array.isArray(type)) {
      type.forEach(t => addEventsListener(t, listener));

      return () => {
        type.forEach(t => removeEventsListner(t, listener));
      }
    } else {
      addEventsListener(type, listener);

      return () => {
        removeEventsListner(type, listener);
      }
    }
  }, [...(deps || []), ...(Array.isArray(type) ? type : [type])])
}

export const usePureEventsListner = (listener: (event: EventEntity) => void, deps?: DependencyList) => {
  useEffect(() => {
    socket.on("EVENT_NEW", listener);

    return () => {
      socket.removeListener("EVENT_NEW", listener);
    }
  }, deps || [])
}

export const useUserEventsListner = (listener: (event: UserEventDto) => void, deps?: DependencyList) => {
  useEffect(() => {
    socket.on("USER_EVENT", listener);

    return () => {
      socket.removeListener("USER_EVENT", listener);
    }
  }, deps || [])
}

export function getEvents(query?: QueryEvents): Promise<ResponseList<EventEntity>> {
  return MainRequest.get(`/events`, query)
}

export const onReconnected = (listener: () => void, deps?: DependencyList) => {
  useEffect(() => {
    socket.io.on("reconnect", listener);

    return () => {
      socket.io.removeListener("reconnect", listener);
    }
  }, deps || [])
}