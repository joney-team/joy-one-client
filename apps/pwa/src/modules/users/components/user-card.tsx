"use client";

import { Avatar, AvatarProps } from "@/components/avatar";
import { useLayout } from "@/layout/layout-context";
import { ModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { WorkspaceMemberDataFragment } from "@/modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { getMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { ActionIcon, Card, Group, Stack, Text, em, useMantineTheme } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { FC, MouseEventHandler, ReactNode } from "react";

export interface UserCardProps {
  user: Pick<
    WorkspaceMemberDataFragment,
    "_id" | "userId" | "color" | "memberId" | "name" | "roles"
  >;
  collapsed?: boolean;
  onRemove?: () => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  avatarSize?: number | string;
  avatarProps?: AvatarProps;
  hideOnlineStatus?: boolean;
  rightSection?: ReactNode;
}

export const UserCard: FC<UserCardProps> = (props) => {
  const { user } = props;
  const theme = useMantineTheme();
  const hover = useHover();
  const viewport = useLayout();

  return (
    <ModalUserInformation>
      {(modal) => (
        <Card
          ref={hover.ref}
          key={user.userId}
          p={2}
          style={{
            borderColor: user.color || theme.colors.gray[4],
            borderWidth: "1px",
            boxShadow: "none",
            position: "relative",
            overflow: "visible",
            cursor: props.disabled ? "default" : "pointer",
            userSelect: "none",
          }}
          withBorder
          radius={150}
          bg={user.memberId ? "var(--mantine-color-body)" : "var(--mantine-color-default-hover)"}
          onClick={(e) => {
            if (props.onClick) {
              e.preventDefault();
              e.stopPropagation();
              return props.onClick(e);
            }
          }}
          onDoubleClick={() => modal.open(user.userId)}
        >
          <Group gap={8} wrap="nowrap">
            <Avatar
              user={user}
              size={props.avatarSize || 28}
              radius="xl"
              hideOnlineStatus={props.hideOnlineStatus}
              onlineIndicatorProps={{
                size: 8,
                styles: {
                  indicator: {
                    borderWidth: 1.2,
                  },
                },
              }}
              {...props.avatarProps}
            />

            {!props.collapsed && (
              <Stack gap={0} pr={em(12)}>
                <Text fz={em(10)} fw={600}>
                  {user.name}
                </Text>
                <Text fz={em(8)} fw={500} mt={-2}>
                  {getMemberRoleLabel(user)}
                </Text>
              </Stack>
            )}

            {props.rightSection}
          </Group>

          {typeof props.onRemove === "function" &&
            !props.disabled &&
            (hover.hovered || viewport.view !== "desktop") && (
              <ActionIcon
                color="dark.2"
                radius={100}
                size={em(15)}
                style={{
                  position: "absolute",
                  right: -4,
                  top: -4,
                  border: `1.5px solid var(--mantine-color-body)`,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (typeof props.onRemove === "function") return props.onRemove();
                }}
              >
                <IconX size={7} strokeWidth={4} />
              </ActionIcon>
            )}
        </Card>
      )}
    </ModalUserInformation>
  );
};
