"use client";

import { CustomerFragment } from "@/modules/customers/graphql/fragmentCustomer.graphql";
import { renderFileUrl } from "@/modules/files/files-utils";
import { MessageBoxFragment } from "@/modules/message-boxes/graphql/fragmentMessageBox.graphql";
import { PartnerFragment } from "@/modules/partners/graphql/fragmentPartner.graphql";
import { MetaPageFragment } from "@/modules/plugins/meta-pages/graphql/fragmentMetaPage.graphql";
import { ZaloOaFragment } from "@/modules/plugins/zalo-oas/graphql/fragmentZaloOa.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useIsOnline } from "@/modules/workspace-members/hooks/use-is-member-online";
import { WorkspaceFragment } from "@/modules/workspaces/graphql/fragmentWorkspace.graphql";
import { getAvatarInitials } from "@/utils/string.utils";
import {
  Indicator,
  IndicatorProps,
  Avatar as MantineAvatar,
  AvatarProps as MantineAvatarProps,
} from "@mantine/core";
import { Icon, IconUserSquareRounded } from "@tabler/icons-react";
import { FC } from "react";
import { IconFacebook, IconZalo } from "./icons";

type AvatarUser = {
  name?: string | null;
  avatar?: string | null;
  color?: string | null;
  userId?: string | null;
  memberId?: string | null;
};

export interface AvatarProps extends MantineAvatarProps {
  onClick?: () => void;
  color?: string;
  user?: AvatarUser;
  workspace?: Pick<WorkspaceFragment, "appColor" | "logo" | "name"> & { appIcon?: string | null };
  customer?: Pick<CustomerFragment, "name" | "avatar"> | null | undefined;
  partner?: Pick<PartnerFragment, "name" | "logo"> | null;
  pluginMetaPage?: Pick<MetaPageFragment, "name" | "logo">;
  hideOnlineStatus?: boolean;
  messageBox?: Pick<MessageBoxFragment, "senderName" | "senderAvatar">;
  pluginZaloOa?: Pick<ZaloOaFragment, "info">;
  onlineIndicatorProps?: IndicatorProps;
  icon?: Icon;
  withBorder?: boolean | string;
  fit?: "contain" | "cover";
}

export const Avatar: FC<AvatarProps> = (props) => {
  const {
    onClick,
    user,
    workspace: workspaceProps,
    customer,
    partner,
    pluginMetaPage,
    hideOnlineStatus,
    messageBox,
    pluginZaloOa,
    onlineIndicatorProps,
    icon,
    withBorder,
    ...rest
  } = props;

  const userId = user?.userId || "";
  const isOnline = useIsOnline(userId);

  const color = useColor();

  const getColor = () => {
    if (props.color) return props.color;
    if (props.workspace) {
      if (!props.workspace.appColor || props.workspace.appColor === "primary") return "primary";
      return props.workspace.appColor;
    }
    if (props.pluginMetaPage) return "primary";
    if (props.pluginZaloOa) return "primary";
    if (user && user.color) return user.color;
    return "var(--mantine-color-placeholder)";
  };

  const getIcon = () => {
    if (props.icon) return props.icon;
    if (props.customer) return IconUserSquareRounded;
    if (props.pluginMetaPage) return IconFacebook;
    if (props.pluginZaloOa) return IconZalo;
    return null;
  };

  const getSrc = () => {
    if (props.src) return props.src;
    if (props.messageBox) return props.messageBox.senderAvatar || props.customer?.avatar;
    if (workspaceProps) return workspaceProps.logo || workspaceProps.appIcon;
    if (props.customer) return props.customer.avatar;
    if (props.partner) return props.partner.logo;
    if (props.pluginMetaPage) return props.pluginMetaPage.logo;
    if (props.pluginZaloOa) return props.pluginZaloOa.info.avatar;
    if (props.user) return props.user.avatar;
  };

  const getInitials = () => {
    if (props.children) return props.children;
    if (workspaceProps) return getAvatarInitials(workspaceProps.name);
    if (props.customer) return getAvatarInitials(props.customer.name);
    if (props.partner) return getAvatarInitials(props.partner.name);
    if (props.messageBox && props.messageBox.senderName)
      return getAvatarInitials(props.messageBox.senderName);
    if (props.user && props.user.name) return getAvatarInitials(props.user.name);
    return "";
  };

  const getFit = () => {
    if (props.fit) return props.fit;
    if (props.workspace) return "contain";
    return "cover";
  };

  const Icon = getIcon();
  const initials = getInitials();
  const src = renderFileUrl(getSrc()) || null;

  return (
    <Indicator
      zIndex={1}
      disabled={!isOnline || hideOnlineStatus}
      size={10}
      offset={3}
      color="green"
      withBorder
      opacity={props.opacity}
      position="bottom-end"
      {...props.onlineIndicatorProps}
      onClick={onClick}
    >
      <MantineAvatar
        {...rest}
        src={src}
        style={{
          backgroundColor: src ? "var(--mantine-color-default-hover)" : undefined,
          border: withBorder
            ? `1px solid ${
                typeof withBorder === "string" ? withBorder : "var(--mantine-color-default-hover)"
              }`
            : undefined,
          ...props.style,
        }}
        color={color(getColor())}
        variant="filled"
        styles={{
          image: {
            objectFit: getFit(),
          },
        }}
      >
        {initials || (Icon && <Icon size={18} strokeWidth={1.5} />)}
      </MantineAvatar>
    </Indicator>
  );
};
