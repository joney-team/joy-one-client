import { Button } from "@/components/buttons/button";
import { Selector, SelectorContext, SelectorProps } from "@/components/selector";
import { api } from "@/modules/apis";
import { useQuery } from "@/modules/apis/use-query";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity, ResponseList } from "@/types";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { CategoryEntity, CategoryType } from "../category-types";
import { OnModalCategory } from "../modals/modal-category";

interface CategorySelectorProps
  extends Omit<SelectorProps<CategoryEntity>, "onSelect" | "onSearch" | "renderOption"> {
  type?: CategoryType;
  excludeIds?: string[];
  onSelect?: (value?: CategoryEntity) => void;
  render?: (ctx: SelectorContext<CategoryEntity>) => ReactNode;
  createable?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const CategorySelector: FC<CategorySelectorProps> = (props) => {
  const { type, excludeIds, onSelect, render, createable = true, onClose, onOpen, ...rest } = props;

  const initOptions = useQuery<ResponseList<CategoryEntity>>({
    route: "/categories",
    params: {
      limit: 9,
      sortLastInteractionAt: -1,
      type: props.type,
    },
  });

  return (
    <Selector
      {...rest}
      onOpen={props.onOpen}
      onClose={props.onClose}
      excludeIds={props.excludeIds}
      pinnedOptions={initOptions.data?.data.map((item) => ({ ...item, _group: t("recently") }))}
      autoCloseOnChange={false}
      onSearch={(q) => searchEntity<CategoryEntity>(AppEntity.CATEGORIES, q, { type: props.type })}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(category) => {
        return (
          <Combobox.Option value={category._id} key={category._id}>
            <Group gap={10}>
              <Text>{category.name}</Text>
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
      onSelect={(e) => {
        if (!e) return;
        api.patch(`/categories/${e._id}/interact`).catch(() => false);
        return props.onSelect?.(e);
      }}
      onCreate={createable ? () => OnModalCategory({ onSuccess: props.onSelect, type }) : undefined}
    />
  );
};
