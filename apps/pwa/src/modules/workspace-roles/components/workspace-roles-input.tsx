"use client";

import { Hovered } from "@/components/hovered";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Badge, Group, InputWrapper, InputWrapperProps } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FC, useMemo } from "react";
import { WorkspaceRoleDataFragment } from "../graphql/fragmentWorkspaceRole.graphql";
import { useNormalizeRoles } from "../hooks/use-normalize-roles";
import { WorkspaceRolesSelector } from "./workspace-roles-selector";

type WorkspaceRoleOption = Pick<WorkspaceRoleDataFragment, "_id" | "name" | "color">;

interface WorkspaceRolesInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value: WorkspaceRoleOption[];
  onChange: (value: WorkspaceRoleOption[]) => void;
  disabled?: boolean;
  autoHide?: boolean;
}

export const WorkspaceRolesInput: FC<WorkspaceRolesInputProps> = (props) => {
  const color = useColor();
  const { value, onChange, disabled, autoHide, ...rest } = props;
  const { normalizeRole } = useNormalizeRoles();

  const roles = useMemo(() => value.map(normalizeRole), [value]);

  const onAdd = (role: WorkspaceRoleOption) => {
    const isSelected = roles.some((v) => role?._id === v._id);
    const workspaceRoles = isSelected
      ? roles.filter((v) => v._id !== role._id)
      : [...roles, normalizeRole(role)];
    props.onChange(workspaceRoles);
  };

  const onRemove = (roleId: string) => {
    const workspaceRoles = roles.filter((v) => v._id !== roleId);
    props.onChange(workspaceRoles);
  };

  return (
    <InputWrapper {...rest}>
      <WorkspaceRolesSelector
        disabled={disabled}
        selectedIds={roles.map((v) => v._id)}
        onSelect={(role) => {
          const isSelected = roles.some((v) => role?._id === v._id);
          if (isSelected) {
            onRemove(role._id);
          } else {
            onAdd(role);
          }
        }}
        target={(ctx) => {
          return (
            <Hovered disabled={disabled}>
              {(hover) => {
                return (
                  <Group
                    ref={hover.ref}
                    className={!disabled ? "clickable" : "unselectable"}
                    flex={1}
                    onClick={ctx.toggle}
                    gap={5}
                  >
                    {roles.map((v) => {
                      return (
                        <Hovered key={v._id} disabled={disabled}>
                          {(hover) => {
                            return (
                              <Badge
                                ref={hover.ref}
                                variant="light"
                                color={color(v.color || "gray")}
                                pr={hover.hovered ? 0 : undefined}
                                rightSection={
                                  hover.hovered && (
                                    <ActionIcon
                                      component="div"
                                      radius={100}
                                      variant="subtle"
                                      color="gray"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(v._id);
                                      }}
                                    >
                                      <IconMinus size={13} style={{ marginLeft: -3 }} />
                                    </ActionIcon>
                                  )
                                }
                              >
                                {v.name}
                              </Badge>
                            );
                          }}
                        </Hovered>
                      );
                    })}

                    {!disabled && (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        opacity={hover.hovered || (roles.length === 0 && !autoHide) ? 1 : 0}
                        onClick={ctx.toggle}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                );
              }}
            </Hovered>
          );
        }}
      />
    </InputWrapper>
  );
};
