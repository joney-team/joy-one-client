import { useQuery } from "@apollo/client/react";
import QUERY_ATTENDANCE_SETTING from "../graphql/queryAttendanceSetting.graphql";

export const useAttendanceSetting = () => {
  const { data, loading, error } = useQuery(QUERY_ATTENDANCE_SETTING);

  return {
    attendanceSetting: data?.attendanceSetting,
    loading,
    error,
  };
};
