import { useQuery } from "@apollo/client/react";
import GetAttendanceSettingDocument from "../graphql/getAttendanceSetting.graphql";

export const useAttendanceSetting = () => {
  const { data, loading, error } = useQuery(GetAttendanceSettingDocument);

  return {
    attendanceSetting: data?.attendanceSetting,
    loading,
    error,
  };
};
