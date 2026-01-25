"use client";

import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useEffect, useMemo } from "react";
import MUTATION_CREATE_WORKSPACE_ROLE from "../graphql/mutationCreateWorkspaceRole.graphql";
import MUTATION_DELETE_WORKSPACE_ROLE from "../graphql/mutationDeleteWorkspaceRole.graphql";
import MUTATION_UPDATE_WORKSPACE_ROLE from "../graphql/mutationUpdateWorkspaceRole.graphql";
import QUERY_WORKSPACE_ROLES from "../graphql/queryWorkspaceRoles.graphql";
import { WorkspaceDefaultRoleId } from "../workspace-roles-types";
import { useNormalizeRoles } from "./use-normalize-roles";

export const useWorkspaceRoles = () => {
  const { member } = useWorkspace();
  const { normalizeRole } = useNormalizeRoles();

  const [getWorkspaceRoles, { data, loading, error }] = useLazyQuery(QUERY_WORKSPACE_ROLES);
  const [update] = useMutation(MUTATION_UPDATE_WORKSPACE_ROLE);
  const [create] = useMutation(MUTATION_CREATE_WORKSPACE_ROLE);
  const [deleteRole] = useMutation(MUTATION_DELETE_WORKSPACE_ROLE);

  useEffect(() => {
    if (member?.workspaceId) getWorkspaceRoles();
  }, [member?.workspaceId]);

  const roles = useMemo(() => {
    return (data?.workspaceRoles ?? []).map(normalizeRole);
  }, [data?.workspaceRoles]);

  return {
    data,
    loading,
    error,
    create,
    update,
    detele: deleteRole,
    roles: roles,
    selectableRoles: roles.filter((v) => v._id !== WorkspaceDefaultRoleId.OWNER),
  };
};
