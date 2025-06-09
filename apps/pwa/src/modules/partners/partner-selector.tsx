import { AppEntity } from "@/types";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { OnModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { t } from "@/modules/lang/lang-service";
import { getPartners } from "@/modules/partners/partners-service";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { searchEntity } from "@/modules/search/search-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { em, Group, Stack, Text } from "@mantine/core";
import { IconPhone, IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext, SelectorProps } from "../../components/selector/selector";

interface PartnerSelectorProps
  extends Omit<
    SelectorProps<PartnerEntity>,
    "renderTarget" | "onSearch" | "onInitOptions" | "searchPlaceholder" | "renderOptionChild" | "onCreate"
  > {
  renderTrigger?: (ctx: SelectorContext<PartnerEntity>) => ReactNode;
  createable?: boolean;
  optionRightSection?: (value: PartnerEntity) => ReactNode;
}

export const PartnerSelector: FC<PartnerSelectorProps> = (props) => {
  const { renderTrigger, createable = true, optionRightSection, ...rest } = props;

  const workspace = useWorkspace();
  const _createable = createable && workspace.hasPermission(WorkspacePermission.PARTNERS_WRITE);

  return (
    <Selector
      {...rest}
      onSearch={(q) => searchEntity<PartnerEntity>(AppEntity.PARTNERS, q)}
      onInitOptions={() => getPartners({ limit: 5 }).then((res) => res.data)}
      searchPlaceholder={`${t("search_with", { query: ["name"].map((v) => t(v).toLowerCase()).join(", ") })}`}
      renderOptionChild={(item) => {
        return (
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
        );
      }}
      renderTarget={(ctx) => {
        const { toggle } = ctx;
        if (renderTrigger) return renderTrigger(ctx);
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
            {t("select")}
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
