"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { ModalHead } from "@/components/modal/modal-head";
import { permissionGroups } from "@/modules/workspace-roles/workspace-roles-config";
import { removeWorkspaceRole } from "@/modules/workspace-roles/workspace-roles-service";
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/useWorkspaceSetting";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Card,
  Divider,
  Group,
  InputWrapper,
  Stack,
  Switch,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconAccessible, IconCheck, IconLock } from "@tabler/icons-react";
import { FC } from "react";
import { useWorkspaceRoles } from "../hooks/use-workspace-roles";
import { workspacePermissions } from "../workspace-roles-constants";

interface ModalWorkspaceRoleFormProps {
  roleId?: string;
}

export const ModalWorkspaceRoleForm: FC<ModalWorkspaceRoleFormProps> = (props) => {
  const workspace = useWorkspace();
  const { updateWorkspaceSetting } = useWorkspaceSetting();
  const { roles, create, update } = useWorkspaceRoles();
  const { t } = useLingui();
  const role = roles.find((role) => role._id === props.roleId);

  const close = () => modals.close("ModalRoleForm");

  const isAbleToEdit = role && role.isEditable;

  const form = useForm({
    initialValues: {
      name: role?.name ?? "",
      permissions: role?.permissions ?? [],
      description: role?.description ?? "",
    },
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    if (props.roleId === WorkspaceDefaultRoleId.MEMBER) {
      await updateWorkspaceSetting({
        memberPermissions: values.permissions,
      })
        .then(async () => close())
        .catch(onError);
    } else {
      const payload = {
        ...values,
        permissions: values.permissions,
      };

      const action = role
        ? () => update({ variables: { ...payload, id: role._id } })
        : () => create({ variables: payload });

      await action()
        .then(async () => close())
        .catch((error) => onFormError(form, error));
    }
  });

  const allPermissions = Object.values(permissionGroups).reduce((acc, group) => {
    return [...acc, ...group.permissions];
  }, [] as { value: WorkspacePermission; dependentPermissions?: WorkspacePermission[] }[]);

  return (
    <Stack>
      <TextInput
        label={<Trans>Name</Trans>}
        withAsterisk
        disabled={!isAbleToEdit || props.roleId === WorkspaceDefaultRoleId.MEMBER}
        {...form.getInputProps("name")}
      />

      {isAbleToEdit && props.roleId !== WorkspaceDefaultRoleId.MEMBER && (
        <Textarea
          label={<Trans>Description</Trans>}
          {...form.getInputProps("description")}
          style={{ minHeight: 80 }}
        />
      )}

      <InputWrapper label={<Trans>Grant permissions</Trans>}>
        <Stack mt={10}>
          {Object.entries(permissionGroups)
            .filter(
              ([_, group]) => !group.workspaceTypes || group.workspaceTypes.includes(workspace.type)
            )
            .map(([groupKey, group]) => {
              const addPermission = (
                permission: WorkspacePermission,
                dependentPermissions: WorkspacePermission[] = []
              ) => {
                const perrmissions = [
                  ...form.values.permissions,
                  ...dependentPermissions,
                  permission,
                ];
                form.setFieldValue("permissions", [...new Set(perrmissions)]);
              };

              const removePermission = (permission: WorkspacePermission) => {
                const perrmissions = [...form.values.permissions];
                form.setFieldValue("permissions", [
                  ...new Set(perrmissions.filter((p) => p !== permission)),
                ]);
              };

              return (
                <Card key={groupKey} withBorder p={10} shadow="none">
                  <Stack>
                    <Divider label={group.name()} labelPosition="left" />

                    {group.permissions.map((permission, i) => {
                      const dependentPermissions = allPermissions.filter(
                        (p) =>
                          p.value !== permission.value &&
                          form.values.permissions.includes(p.value) &&
                          p.dependentPermissions &&
                          p.dependentPermissions.includes(permission.value)
                      );

                      const isHasDependentPermissions = dependentPermissions.length > 0;
                      const isDisabled = !isAbleToEdit || isHasDependentPermissions;
                      const isChecked = form.values.permissions.includes(permission.value);

                      const onToggle = () => {
                        if (isDisabled) return;
                        const _isChecked = form.values.permissions.includes(permission.value);
                        if (_isChecked) {
                          removePermission(permission.value);
                        } else {
                          addPermission(permission.value, permission.dependentPermissions);
                        }
                      };

                      return (
                        <Group
                          key={groupKey + i + permission.value}
                          style={{ cursor: isDisabled ? "default" : "pointer" }}
                          gap={5}
                        >
                          <Switch
                            key={permission.value}
                            label={workspacePermissions[permission.value].name()}
                            color={isHasDependentPermissions ? "orange" : undefined}
                            checked={isChecked}
                            onClick={onToggle}
                          />

                          {isHasDependentPermissions && (
                            <Tooltip
                              label={t`Dependent permissions: ${dependentPermissions
                                .map((p) => p.value)
                                .join(", ")}`}
                            >
                              <ThemeIcon size={16} variant="light" color="gray">
                                <IconLock />
                              </ThemeIcon>
                            </Tooltip>
                          )}
                        </Group>
                      );
                    })}
                  </Stack>
                </Card>
              );
            })}
        </Stack>
      </InputWrapper>

      {isAbleToEdit && (
        <Button
          mt={10}
          loading={form.submitting}
          onClick={() => onSubmit()}
          leftIcon={IconCheck}
          disabled={!form.isDirty()}
        >
          {props.roleId ? <Trans>Update</Trans> : <Trans>Create</Trans>}
        </Button>
      )}

      <ButtonArchive
        enabled={!!role?._id}
        process={() => removeWorkspaceRole(role!._id)}
        onArchived={() => close()}
        goBackWhenArchived={false}
      />
    </Stack>
  );
};

export const OnModalRoleForm = (props?: ModalWorkspaceRoleFormProps) => {
  return modals.open({
    modalId: "ModalRoleForm",
    title: (
      <ModalHead
        name={`${props?.roleId ? t`Update role` : t`Create role`}`}
        icon={IconAccessible}
      />
    ),
    children: <ModalWorkspaceRoleForm {...props} />,
  });
};
