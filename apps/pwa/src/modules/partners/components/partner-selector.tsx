"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { searchEntity } from "@/modules/search/search-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { Trans } from "@lingui/react/macro";
import { Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconPhone, IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext, SelectorProps } from "../../../components/selector";
import { PartnerFragment } from "../graphql/fragmentPartner.graphql";
import GetPartnersDocument from "../graphql/getPartners.graphql";

interface PartnerSelectorProps extends Omit<
  SelectorProps<PartnerFragment>,
  "renderTarget" | "onSearch" | "searchPlaceholder" | "renderOption" | "onCreate" | "target"
> {
  target?: (ctx: SelectorContext<PartnerFragment>) => ReactNode;
  createable?: boolean;
  optionRightSection?: (value: PartnerFragment) => ReactNode;
}

export const PartnerSelector: FC<PartnerSelectorProps> = (props) => {
  const { target, createable = true, optionRightSection, ...rest } = props;

  const workspace = useWorkspace();
  const _createable = createable && workspace.hasPermission(WorkspacePermission.PARTNERS_WRITE);

  return (
    <ModalParnterForm>
      {(open) => (
        <Selector<PartnerFragment>
          {...rest}
          onSearch={(q) => searchEntity<PartnerFragment>(AppEntity.PARTNERS, q)}
          listQuery={GetPartnersDocument}
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
                fw={500}
                onClick={toggle}
              >
                <Trans>Select</Trans>
              </Button>
            );
          }}
          onCreate={
            _createable
              ? (ctx) =>
                  open({
                    onDone: (partner) => props.onSelect?.(partner, ctx),
                  })
              : undefined
          }
        />
      )}
    </ModalParnterForm>
  );
};
