import { EventType } from "@/graphql/enums.graphql";
import { Query } from "@/types";

export interface QueryEvents extends Query {
  type?: EventType | EventType[];
  userId?: string;
  ref?: string;
}

export interface UserEventDto {
  userId: string;
  eventName: string;
  data?: any;
}
