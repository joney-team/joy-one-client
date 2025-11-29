import { UserCard, UserCardProps } from "@/modules/users/components/user-card";
import {
  WorkspaceMemberSelector,
  WorkspaceMemberSelectorProps,
} from "@/modules/workspace-members/components/workspace-member-selector";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { ActionIcon, em } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { FC } from "react";

interface WorkspaceMemberInputProps
  extends Omit<WorkspaceMemberSelectorProps, "value" | "onChange" | "target"> {
  value?: WorkspaceMemberInfo;
  onChange?: (value?: WorkspaceMemberInfo) => void;
  collapsed?: boolean;
  clearable?: boolean;
  userCardProps?: Omit<UserCardProps, "user">;
}

export const WorkspaceMemberInput: FC<WorkspaceMemberInputProps> = (props) => {
  const { value, onChange, collapsed, clearable, userCardProps, ...rest } = props;

  return (
    <WorkspaceMemberSelector
      {...rest}
      excludeIds={props.value ? [props.value.userId] : []}
      onSelect={(user) => props.onChange?.(user as any)}
      target={(ctx) => {
        if (value)
          return (
            <UserCard
              avatarSize={rest.avatarSize}
              user={value}
              collapsed={collapsed}
              onClick={ctx.toggle}
              onRemove={clearable ? () => onChange?.() : undefined}
              disabled={rest.disabled}
              hideOnlineStatus={collapsed}
              {...userCardProps}
            />
          );

        return (
          <ActionIcon
            color="gray.4"
            size={rest.iconSize || em(34)}
            variant="outline"
            radius={150}
            onClick={(e) => {
              e.stopPropagation();
              ctx.toggle();
            }}
            disabled={rest.disabled}
          >
            <IconUserPlus size={18} />
          </ActionIcon>
        );
      }}
    />
  );
};
