import { Avatar } from "@/components/avatar";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { getUserMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { AppEntity } from "@/types";
import { ActionIcon, Combobox, em, Group, InputWrapperProps, Stack, Text } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";

export interface WorkspaceMemberSelectorProps
  extends Omit<InputWrapperProps, "value" | "onChange" | "onSelect"> {
  excludeIds?: string[];
  onSelect: (value: WorkspaceMember) => void;
  render?: (ctx: SelectorContext<WorkspaceMember>) => ReactNode;
  iconSize?: number;
  avatarSize?: number;
  collapsed?: boolean;
  disabled?: boolean;
  optionRightSection?: (user: WorkspaceMember) => ReactNode;
}

export const WorkspaceMemberSelector: FC<WorkspaceMemberSelectorProps> = (props) => {
  const {
    excludeIds,
    onSelect,
    render,
    iconSize,
    avatarSize,
    collapsed,
    disabled,
    optionRightSection,
    ...rest
  } = props;

  return (
    <Selector<WorkspaceMember>
      {...rest}
      autoCloseOnChange={false}
      excludeIds={props.excludeIds}
      listRoute="/workspace-members"
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(user) => {
        return (
          <Combobox.Option value={user._id} key={user._id}>
            <Group gap={8} justify="space-between">
              <Group gap={8}>
                <Avatar user={user} size={em(28)} />
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
        if (props.render) return props.render(ctx);

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
      onSelect={(e) => {
        if (!e) return;
        props.onSelect(e);
      }}
      onSearch={(q) => searchEntity(AppEntity.WORKSPACE_MEMBERS, q)}
    />
  );
};
