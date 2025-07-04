import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity, ResponseList } from "@/types";
import { Combobox, em, Group, Stack, Text } from "@mantine/core";
import { IconPhone, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Selector, SelectorProps } from "../../../components/selector";
import { useQuery } from "../../apis/use-query";
import { customerInteraction } from "../customer-service";

interface CustomerSelectorProps
  extends Omit<SelectorProps<CustomerShortInfo>, "onSearch" | "renderOption"> {}

export const CustomerSelector: FC<CustomerSelectorProps> = (props) => {
  const initOptions = useQuery<ResponseList<CustomerShortInfo>>({
    route: "/customers",
    params: {
      limit: 15,
      sortLastInteractionAt: -1,
    },
  });

  return (
    <Selector
      {...props}
      onSearch={(q) => searchEntity<CustomerShortInfo>(AppEntity.CUSTOMERS, q)}
      initOptions={initOptions.data?.data.map((item) => ({ ...item, _group: t("recently") }))}
      searchPlaceholder={`${t("search_with", {
        query: ["name", "phone", "email", "code"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
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
            fz={em(14)}
            fw={500}
            onClick={toggle}
          >
            {t("select")}
          </Button>
        );
      }}
      onSelect={(value, ctx) => {
        if (!value) return;
        props.onSelect?.(value, ctx);
        customerInteraction(value._id);
        initOptions.refetch();
      }}
    />
  );
};
