import { Avatar } from "@/components/avatar";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { getUserMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { AppEntity } from "@/types";
import { ActionIcon, Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorProps } from "../../../components/selector";

export interface WorkspaceMemberSelectorProps
  extends Omit<SelectorProps<WorkspaceMember>, "listRoute" | "searchPlaceholder" | "renderOption"> {
  iconSize?: number;
  avatarSize?: number;
  collapsed?: boolean;
  optionRightSection?: (user: WorkspaceMember) => ReactNode;
}

export const WorkspaceMemberSelector: FC<WorkspaceMemberSelectorProps> = (props) => {
  const { iconSize, avatarSize, collapsed, optionRightSection, ...rest } = props;

  return (
    <Selector<WorkspaceMember>
      {...rest}
      autoCloseOnChange={false}
      listRoute="/workspace-members"
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(user) => {
        return (
          <Combobox.Option value={user._id} key={user._id}>
            <Group gap={8} justify="space-between">
              <Group gap={8}>
                <Avatar user={user} size={avatarSize || 28} />
                <Stack gap={3}>
                  <Text>{user.name}</Text>

                  <Text fz={em(10)} mt={-2}>
                    {getUserMemberRoleLabel(user)}
                  </Text>
                </Stack>
              </Group>

              {props.optionRightSection && props.optionRightSection(user)}
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        if (rest.target) return rest.target(ctx);

        return (
          <ActionIcon
            color="gray.4"
            size={props.iconSize || em(34)}
            variant="outline"
            radius={150}
            onClick={ctx.toggle}
          >
            <IconUserPlus size={18} />
          </ActionIcon>
        );
      }}
      onSearch={(q) => searchEntity(AppEntity.WORKSPACE_MEMBERS, q)}
    />
  );
};
