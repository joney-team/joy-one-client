"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { Trans } from "@lingui/react/macro";
import { Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconPhone, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Selector, SelectorProps } from "../../../components/selector";

export type CustomerSelectorValue = Pick<CustomerShortInfo, "_id" | "name" | "phone" | "avatar">;

interface CustomerSelectorProps
  extends Omit<SelectorProps<CustomerSelectorValue>, "onSearch" | "renderOption"> {}

export const CustomerSelector: FC<CustomerSelectorProps> = (props) => {
  return (
    <Selector
      {...props}
      listRoute="/customers"
      onSearch={(q) => searchEntity<CustomerSelectorValue>(AppEntity.CUSTOMERS, q)}
      renderOption={(item) => {
        return (
          <Combobox.Option value={item._id} key={item._id}>
            <Group gap={8} align="center" py={5}>
              <Avatar customer={item} size={em(28)} />
              <Stack gap={0}>
                <Text>{item.name}</Text>
                {!!item.phone && (
                  <Group gap={3}>
                    <IconPhone size={13} strokeWidth={1.5} />
                    <Text fz={em(12)}>{item.phone}</Text>
                  </Group>
                )}
              </Stack>
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        const { toggle } = ctx;
        if (props.target) return props.target(ctx);

        return (
          <Button
            tt="capitalize"
            size="xs"
            variant="light"
            radius={100}
            leftIcon={IconPlus}
            onClick={toggle}
          >
            <Trans>Select</Trans>
          </Button>
        );
      }}
      onSelect={(value, ctx) => {
        if (!value) return;
        props.onSelect?.(value, ctx);
      }}
    />
  );
};
