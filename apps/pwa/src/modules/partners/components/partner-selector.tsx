"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { tl } from "@/modules/lang/lang-service";
import { OnModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { searchEntity } from "@/modules/search/search-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconPhone, IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext, SelectorProps } from "../../../components/selector";

interface PartnerSelectorProps
  extends Omit<
    SelectorProps<PartnerEntity>,
    "renderTarget" | "onSearch" | "searchPlaceholder" | "renderOption" | "onCreate" | "target"
  > {
  target?: (ctx: SelectorContext<PartnerEntity>) => ReactNode;
  createable?: boolean;
  optionRightSection?: (value: PartnerEntity) => ReactNode;
}

export const PartnerSelector: FC<PartnerSelectorProps> = (props) => {
  const { target, createable = true, optionRightSection, ...rest } = props;

  const workspace = useWorkspace();
  const _createable = createable && workspace.hasPermission(WorkspacePermission.PARTNERS_WRITE);

  return (
    <Selector<PartnerEntity>
      {...rest}
      onSearch={(q) => searchEntity<PartnerEntity>(AppEntity.PARTNERS, q)}
      listRoute="/partners"
      searchPlaceholder={`${tl("search_with", {
        query: ["name"].map((v) => tl(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(item) => {
        return (
          <Combobox.Option value={item._id} key={item._id}>
            <Group gap={8} justify="space-between">
              <Group gap={8}>
                <Avatar partner={item} size={em(28)} />
                <Stack gap={3}>
                  <Text>{item.name}</Text>
                  {!!item.phone && (
                    <Group gap={3}>
                      <IconPhone size={13} strokeWidth={1.5} />
                      <Text fz={em(12)}>{item.phone}</Text>
                    </Group>
                  )}
                </Stack>
              </Group>
              {optionRightSection?.(item)}
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        const { toggle } = ctx;
        if (target) return target(ctx);
        return (
          <Button
            tt="capitalize"
            size="xs"
            variant="light"
            radius={100}
            leftIcon={IconPlus}
            fz={em(14)}
            fw={500}
            onClick={toggle}
          >
            {tl("select")}
          </Button>
        );
      }}
      onCreate={
        _createable
          ? (ctx) =>
              OnModalParnterForm({
                onDone: (partner) => props.onSelect?.(partner, ctx),
              })
          : undefined
      }
    />
  );
};
