import { useColor } from "@/modules/theme/use-color";
import { OnModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { UserCard } from "@/modules/users/user-card";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { ActionIcon, em, Group, InputWrapperProps, ThemeIcon, Tooltip } from "@mantine/core";
import { IconFlagFilled, IconUserPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Renderer } from "../../../components/renderer";

interface WorkspaceMembersInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: WorkspaceMemberInfo[];
  onChange?: (value: WorkspaceMemberInfo[]) => void;
  collapsed?: boolean;
  showMainResponsible?: boolean;
  disabled?: boolean;
  length?: number;
  ignoreUserIds?: string[];
  avatarSize?: number | string;
  iconSize?: number | string;
  tooltipLabel?: string;
}

export const WorkspaceMembersInput: FC<WorkspaceMembersInputProps> = (props) => {
  const color = useColor();
  const {
    value,
    onChange,
    collapsed,
    showMainResponsible,
    length,
    ignoreUserIds,
    avatarSize,
    iconSize,
    tooltipLabel,
    ...rest
  } = props;

  const users = value || [];
  const disabled = props.disabled || !!!onChange;

  const toogleSelect = (user: WorkspaceMemberInfo) => {
    const index = users.findIndex((u) => u.userId === user.userId);
    if (index === -1) {
      onChange?.([...users, user]);
    } else {
      onChange?.(users.filter((u) => u.userId !== user.userId));
    }
  };

  return (
    <WorkspaceMemberSelector
      {...rest}
      excludeIds={users.map((u) => u.userId)}
      onSelect={toogleSelect}
      render={(ctx) => {
        return (
          <Group
            flex={props.flex}
            w="100%"
            gap={collapsed ? 5 : 10}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              ctx.toggle();
            }}
            className={!props.disabled ? "clickable" : ""}
          >
            {users.length > 0 &&
              users.map((user, i) => {
                return (
                  <Tooltip label={user.name} key={user.userId}>
                    <Group align="center" justify="center" style={{ position: "relative" }}>
                      <UserCard
                        avatarSize={avatarSize}
                        user={user}
                        collapsed={collapsed}
                        onClick={() => {
                          OnModalUserInformation(user.userId);
                          ctx.close();
                        }}
                        onRemove={onChange && (() => toogleSelect(user))}
                        disabled={disabled}
                      />

                      {showMainResponsible && i === 0 && (
                        <ThemeIcon
                          variant="transparent"
                          color={color("yellow")}
                          style={{
                            position: "absolute",
                            top: -8,
                            left: -8,
                            filter: `drop-shadow(0 1px 0px var(--mantine-color-body)) drop-shadow(0 1px 0px var(--mantine-color-body)) drop-shadow(0 0px 2px var(--mantine-color-body))`,
                            transform: "rotate(-25deg)",
                          }}
                        >
                          <IconFlagFilled size={16} />
                        </ThemeIcon>
                      )}
                    </Group>
                  </Tooltip>
                );
              })}

            <Renderer visible={!disabled}>
              <Tooltip label={tooltipLabel} disabled={!!!tooltipLabel || disabled}>
                <ActionIcon
                  color="gray.4"
                  size={iconSize || em(34)}
                  variant="outline"
                  radius={150}
                  onClick={ctx.toggle}
                >
                  <IconUserPlus size={18} />
                </ActionIcon>
              </Tooltip>
            </Renderer>
          </Group>
        );
      }}
    />
  );
};
