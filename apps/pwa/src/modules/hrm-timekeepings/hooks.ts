import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { EventType } from "@/modules/events/event-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getPreviousTimeKeeping } from "./hrm-timekeepings-service";
import { HrmTimekeepingType } from "./hrm-timekeepings-types";

export const useHrmTimekeeping = () => {
  const workspace = useWorkspace();

  const prevTimekeeping = useFetch({
    fetch: () => getPreviousTimeKeeping(),
    events: [
      EventType.HRM_TIMEKEEPING_MEMBER_CHECK_IN,
      EventType.HRM_TIMEKEEPING_MEMBER_CHECK_OUT,
    ]
  });

  const load = async () => {
    try {
      await Promise.all([
        prevTimekeeping.fetch(),
      ])
      return true;
    } catch (error) {
      onError(error);
      return false;
    } finally {
    }
  }

  const prevType = prevTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
  const nextType = prevType === HrmTimekeepingType.CHECK_IN ? HrmTimekeepingType.CHECK_OUT : HrmTimekeepingType.CHECK_IN;

  return {
    load,
    loading: !prevTimekeeping.isInitialized,
    prevTimekeeping: prevTimekeeping.data,
    prevType,
    nextType,
    isAvailable: workspace.isHrmTimekeepingAvailable,
  }
}