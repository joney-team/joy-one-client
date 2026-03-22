"use client";

import { useVariablesQuery } from "@/modules/apollo/use-query";
import QUERY_WORKSPACE_MEMBER from "../graphql/queryWorkspaceMember.graphql";

export const useWorkspaceMember = (userId: string) => {
  const { data, loading, error } = useVariablesQuery(QUERY_WORKSPACE_MEMBER, {
    userId,
  });

  return {
    member: data?.workspaceMember,
    loading,
    error,
  };
};
