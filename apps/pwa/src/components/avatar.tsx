import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { renderLink } from "@/modules/files/files-utils";
import { MessageBoxEntity } from "@/modules/message-boxes/message-boxes-types";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { PluginMetaPageEntity } from "@/modules/plugins/meta-pages/meta-pages-types";
import { PluginZaloOaEntity } from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceEntity } from "@/modules/workspaces/workspaces-types";
import { getAvatarInitials } from "@/utils/string.utils";
import { primaryColors } from "@joy-one-client/config/colors";
import { Indicator, IndicatorProps, Avatar as MantineAvatar, AvatarProps as MantineAvatarProps } from "@mantine/core";
import { Icon, IconUserSquareRounded } from "@tabler/icons-react";
import { FC } from "react";
import { IconFacebook, IconZalo } from "./icons";

export interface AvatarProps extends MantineAvatarProps {
  onClick?: () => void;
  color?: string;
  user?: Pick<WorkspaceMember, "name" | "avatar" | "color" | "userId" | "memberId">;
  workspace?: Pick<WorkspaceEntity, "appColor" | "logo" | "name" | "appName">;
  customer?: CustomerShortInfo;
  partner?: PartnerEntity;
  pluginMetaPage?: PluginMetaPageEntity;
  hideOnlineStatus?: boolean;
  messageBox?: MessageBoxEntity;
  pluginZaloOa?: PluginZaloOaEntity;
  onlineIndicatorProps?: IndicatorProps;
  icon?: Icon;
  withBorder?: boolean;
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
  const workspace = useWorkspace();
  const isOnline = userId && !!workspace.onlineStatus[userId];
  const color = useColor();

  const getColor = () => {
    if (props.color) return props.color;
    if (props.workspace) {
      if (!props.workspace.appColor || props.workspace.appColor === "primary") return primaryColors[6];
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
    if (workspaceProps) return workspaceProps.logo;
    if (props.customer) return props.customer.avatar;
    if (props.partner) return props.partner.logo;
    if (props.pluginMetaPage) return props.pluginMetaPage.logo;
    if (props.pluginZaloOa) return props.pluginZaloOa.avatar;
    if (props.user) return props.user.avatar;
  };

  const getInitials = () => {
    if (props.children) return props.children;
    if (workspaceProps) return getAvatarInitials(workspaceProps.name);
    if (props.customer) return getAvatarInitials(props.customer.name);
    if (props.partner) return getAvatarInitials(props.partner.name);
    if (props.messageBox && props.messageBox.senderName) return getAvatarInitials(props.messageBox.senderName);
    if (props.user) return getAvatarInitials(props.user.name);
    return "";
  };

  const getFit = () => {
    if (props.fit) return props.fit;
    if (props.workspace) return "contain";
    return "cover";
  };

  const Icon = getIcon();
  const initials = getInitials();
  const src = renderLink(getSrc()) || null;

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
    >
      <MantineAvatar
        {...rest}
        src={src}
        style={{
          backgroundColor: src ? "var(--mantine-color-body)" : undefined,
          border: withBorder ? `1px solid var(--mantine-color-body)` : undefined,
          ...props.style,
        }}
        color={color(getColor())}
        variant="filled"
        styles={{
          placeholder: {
            fontWeight: 400,
          },
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
