import { ActivityContextType } from "@/graphql/types.graphql";

export interface ActivitiesProps {
  contextType: ActivityContextType;
  contextId: string;
}
