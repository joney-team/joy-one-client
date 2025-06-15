import { Button } from "@/components/buttons/button";
import { Selector, SelectorContext, SelectorProps } from "@/components/selector";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { interactTag } from "@/modules/tags/tags-service";
import { AppEntity, ResponseList } from "@/types";
import { em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { api } from "../apis";
import { CategoryEntity, CategoryType } from "./category-types";

interface CategorySelectorProps
  extends Omit<SelectorProps<CategoryEntity>, "onSelect" | "onSearch"> {
  type: CategoryType;
  excludeIds?: string[];
  onSelect: (value?: CategoryEntity) => void;
  render?: (ctx: SelectorContext<CategoryEntity>) => ReactNode;
  createable?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const CategorySelector: FC<CategorySelectorProps> = (props) => {
  const { type, excludeIds, onSelect, render, createable = true, onClose, onOpen, ...rest } = props;

  const onInitOptions = async () => {
    return api
      .get<ResponseList<CategoryEntity>>("/categories", {
        params: {
          limit: 9,
          sort: "lastInteractionAtDesc",
          type: props.type,
        },
      })
      .then((res) => res.data.map((category) => ({ ...category, _group: t("recently") })));
  };

  return (
    <Selector
      {...rest}
      onOpen={props.onOpen}
      onClose={props.onClose}
      excludeIds={props.excludeIds}
      onInitOptions={onInitOptions}
      autoCloseOnChange={false}
      onSearch={(q) => searchEntity<CategoryEntity>(AppEntity.CATEGORIES, q, { type: props.type })}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOptionChild={(category) => {
        return (
          <Group gap={10}>
            <Text>{category.name}</Text>
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
        interactTag(e._id);
        return props.onSelect(e);
      }}
      // onCreate={
      //   createable
      //     ? () =>
      //         OnModalCategoryForm({
      //           type: props.type,
      //           onDone: (category) => props.onSelect(category),
      //         })
      //     : undefined
      // }
    />
  );
};
