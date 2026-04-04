"use client";

import { useVariablesQuery } from "@/graphql/use-query";
import GetWorkspaceMemberByUserIdDocument from "../graphql/getWorkspaceMemberByUserId.graphql";

export const useWorkspaceMember = (userId: string) => {
  const { data, loading, error } = useVariablesQuery(GetWorkspaceMemberByUserIdDocument, {
    userId,
  });

  return {
    member: data?.member,
    loading,
    error,
  };
};
