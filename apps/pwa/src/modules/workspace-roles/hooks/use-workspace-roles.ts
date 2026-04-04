"use client";

import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useEffect, useMemo } from "react";
import CreateWorkspaceRoleDocument from "../graphql/createWorkspaceRole.graphql";
import DeleteWorkspaceRoleDocument from "../graphql/deleteWorkspaceRole.graphql";
import GetWorkspaceRolesDocument from "../graphql/getWorkspaceRoles.graphql";
import UpdateWorkspaceRoleDocument from "../graphql/updateWorkspaceRole.graphql";
import { WorkspaceDefaultRoleId } from "../workspace-roles-types";
import { useNormalizeRoles } from "./use-normalize-roles";

export const useWorkspaceRoles = () => {
  const { member } = useWorkspace();
  const { normalizeRole } = useNormalizeRoles();

  const [getWorkspaceRoles, { data, loading, error }] = useLazyQuery(GetWorkspaceRolesDocument);
  const [updateRole] = useMutation(UpdateWorkspaceRoleDocument);
  const [createRole] = useMutation(CreateWorkspaceRoleDocument);
  const [deleteRole] = useMutation(DeleteWorkspaceRoleDocument);

  useEffect(() => {
    if (member?.workspaceId) getWorkspaceRoles();
  }, [member?.workspaceId]);

  const workspaceRoles = useMemo(() => {
    return (data?.workspaceRoles ?? []).map(normalizeRole);
  }, [data?.workspaceRoles]);

  return {
    data,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    workspaceRoles,
    selectableRoles: workspaceRoles.filter((v) => v._id !== WorkspaceDefaultRoleId.OWNER),
  };
};
