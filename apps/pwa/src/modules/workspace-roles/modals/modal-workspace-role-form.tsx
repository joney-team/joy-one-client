"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { ModalHead } from "@/components/modal/modal-head";
import { permissionGroups } from "@/modules/workspace-roles/workspace-roles-config";
import {
  createWorkspaceRole,
  removeWorkspaceRole,
  updateWorkspaceRole,
} from "@/modules/workspace-roles/workspace-roles-service";
import {
  WorkspacePermission,
  WorkspaceRoleDto,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError, onFormErrorLegacy } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
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
import { FC, useState } from "react";
import { workspacePermissions, workspaceSpecialRoleIds } from "../workspace-roles-constants";
import { Trans } from "@lingui/react/macro";

interface ModalWorkspaceRoleFormProps {
  roleId?: string;
}

export const ModalWorkspaceRoleForm: FC<ModalWorkspaceRoleFormProps> = (props) => {
  const workspace = useWorkspace();
  const dynamicRole = workspace.roles.find((role) => role._id === props.roleId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => modals.close("ModalRoleForm");
  const isAbleToEdit = ![WorkspaceSpecialRoleId.OWNER, WorkspaceSpecialRoleId.ADMIN].includes(
    props.roleId as WorkspaceSpecialRoleId
  );

  const getInitialDto = (): WorkspaceRoleDto => {
    if (dynamicRole)
      return {
        name: dynamicRole.name || "",
        permissions: dynamicRole.permissions,
        description: dynamicRole.description || "",
      };

    if (!isAbleToEdit)
      return {
        name: workspaceSpecialRoleIds[props.roleId as WorkspaceSpecialRoleId]?.name(),
        permissions: Object.values(WorkspacePermission),
      };

    if (props.roleId === WorkspaceSpecialRoleId.MEMBER) {
      return {
        name: workspaceSpecialRoleIds[WorkspaceSpecialRoleId.MEMBER]?.name(),
        permissions: workspace.settings.memberPermissions || [],
        description: "",
      };
    }

    return {
      name: "",
      permissions: [],
      description: "",
    };
  };

  const form = useForm<WorkspaceRoleDto>({
    initialValues: getInitialDto(),
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    if (props.roleId === WorkspaceSpecialRoleId.MEMBER) {
      await setWorkspaceSettings({
        ...workspace.settings,
        memberPermissions: values.permissions,
      })
        .then(async () => close())
        .catch(onError);
    } else {
      const payload = {
        ...values,
        permissions: values.permissions,
      };

      const action = dynamicRole
        ? () => updateWorkspaceRole(dynamicRole._id, payload)
        : () => createWorkspaceRole(payload);

      await action()
        .then(async () => close())
        .catch(onFormErrorLegacy(form));
    }

    setIsSubmitting(false);
  });

  const allPermissions = Object.values(permissionGroups).reduce((acc, group) => {
    return [...acc, ...group.permissions];
  }, [] as { value: WorkspacePermission; dependentPermissions?: WorkspacePermission[] }[]);

  return (
    <Stack>
      <TextInput
        label={t`Name`}
        withAsterisk
        disabled={!isAbleToEdit || props.roleId === WorkspaceSpecialRoleId.MEMBER}
        {...form.getInputProps("name")}
      />

      {isAbleToEdit && props.roleId !== WorkspaceSpecialRoleId.MEMBER && (
        <Textarea
          label={t`Description`}
          {...form.getInputProps("description")}
          style={{ minHeight: 80 }}
        />
      )}

      <InputWrapper label={t`Grant permissions`}>
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
          loading={isSubmitting}
          onClick={() => onSubmit()}
          leftIcon={IconCheck}
          disabled={!form.isDirty()}
          action
        >
          {props.roleId ? <Trans>Update</Trans> : <Trans>Create</Trans>}
        </Button>
      )}

      <ButtonArchive
        enabled={!!dynamicRole?._id}
        process={() => removeWorkspaceRole(dynamicRole!._id)}
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
