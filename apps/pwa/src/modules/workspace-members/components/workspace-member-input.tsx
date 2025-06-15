import { UserCard, UserCardProps } from "@/modules/users/user-card";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { ActionIcon, InputWrapperProps, em } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { FC } from "react";
import { WorkspaceMemberSelector } from "@/modules/workspace-members/components/workspace-member-selector";

interface WorkspaceMemberInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: WorkspaceMemberInfo;
  onChange?: (value?: WorkspaceMemberInfo) => void;
  collapsed?: boolean;
  disabled?: boolean;
  ignoreUserIds?: string[];
  avatarSize?: number | string;
  iconSize?: number | string;
  tooltipLabel?: string;
  clearable?: boolean;
  userCardProps?: Omit<UserCardProps, "user">;
}

export const WorkspaceMemberInput: FC<WorkspaceMemberInputProps> = (props) => {
  const {
    value,
    onChange,
    collapsed,
    disabled,
    ignoreUserIds,
    avatarSize,
    iconSize,
    tooltipLabel,
    clearable,
    userCardProps,
    ...rest
  } = props;

  return (
    <WorkspaceMemberSelector
      {...rest}
      excludeIds={props.value ? [props.value.userId] : []}
      onSelect={(user) => props.onChange?.(user)}
      render={(ctx) => {
        if (value)
          return (
            <UserCard
              avatarSize={avatarSize}
              user={value}
              collapsed={collapsed}
              onClick={ctx.toggle}
              onRemove={clearable ? () => onChange?.() : undefined}
              disabled={disabled}
              hideOnlineStatus={collapsed}
              {...userCardProps}
            />
          );

        return (
          <ActionIcon
            color="gray.4"
            size={props.iconSize || em(34)}
            variant="outline"
            radius={150}
            onClick={(e) => {
              e.stopPropagation();
              ctx.toggle();
            }}
            disabled={disabled}
          >
            <IconUserPlus size={18} />
          </ActionIcon>
        );
      }}
    />
  );
};
