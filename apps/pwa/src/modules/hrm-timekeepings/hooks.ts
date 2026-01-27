"use client";

import { EventType } from "@/graphql/enums.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import { getPreviousTimeKeeping } from "./hrm-timekeepings-service";
import { HrmTimekeepingType } from "./hrm-timekeepings-types";

export const useHrmTimekeeping = () => {
  const { isHrmTimekeepingAvailable } = useWorkspaceSetting();

  const prevTimekeeping = useFetch({
    fetch: () => getPreviousTimeKeeping(),
    refetchEvents: [EventType.HrmTimekeepingMemberCheckIn, EventType.HrmTimekeepingMemberCheckOut],
  });

  const load = async () => {
    try {
      await Promise.all([prevTimekeeping.fetch()]);
      return true;
    } catch (error) {
      onError(error);
      return false;
    } finally {
    }
  };

  const prevType = prevTimekeeping.data?.type || HrmTimekeepingType.CHECK_OUT;
  const nextType =
    prevType === HrmTimekeepingType.CHECK_IN
      ? HrmTimekeepingType.CHECK_OUT
      : HrmTimekeepingType.CHECK_IN;

  return {
    load,
    loading: !prevTimekeeping.isInitialized,
    prevTimekeeping: prevTimekeeping.data,
    prevType,
    nextType,
    isAvailable: isHrmTimekeepingAvailable,
  };
};
