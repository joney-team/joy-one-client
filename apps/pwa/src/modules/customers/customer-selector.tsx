import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { AppEntity } from "@/types";
import { customerInteraction, getCustomers } from "./customer-service";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { em, Group, Stack, Text } from "@mantine/core";
import { IconPhone, IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../components/selector";

interface CustomerSelectorProps {
  excludeIds?: string[];
  onSelect: (value: CustomerShortInfo) => void;
  render?: (ctx: SelectorContext<CustomerShortInfo>) => ReactNode;
}

export const CustomerSelector: FC<CustomerSelectorProps> = (props) => {
  return (
    <Selector
      excludeIds={props.excludeIds}
      onSearch={(q) => searchEntity<CustomerShortInfo>(AppEntity.CUSTOMERS, q)}
      onInitOptions={() =>
        getCustomers({ limit: 5, sortLastInteractionAt: -1 }).then((res) => res.data)
      }
      searchPlaceholder={`${t("search_with", {
        query: ["name", "phone", "email", "code"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOptionChild={(item) => {
        return (
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
        );
      }}
      renderTarget={(ctx) => {
        const { toggle } = ctx;
        if (props.render) return props.render(ctx);

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
      onSelect={(e) => {
        if (!e) return;
        props.onSelect(e);
        customerInteraction(e._id);
      }}
    />
  );
};
