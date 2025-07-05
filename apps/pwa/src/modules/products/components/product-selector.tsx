"use client";

import { Button } from "@/components/buttons/button";
import { EntityImage } from "@/components/entity-image";
import { Selector, SelectorContext, SelectorProps } from "@/components/selector";
import { t } from "@/modules/lang/lang-service";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";

interface ProductSelectorProps
  extends Omit<SelectorProps<ProductEntity>, "onSelect" | "onSearch" | "renderOption" | "target"> {
  type?: ProductType | ProductType[];
  isStockCheck?: boolean;
  onSelect: (value: ProductEntity) => void;
  target?: (ctx: SelectorContext<ProductEntity>) => ReactNode;
}

export const ProductSelector: FC<ProductSelectorProps> = (props) => {
  const { type, isStockCheck, excludeIds, onSelect, target, ...rest } = props;
  const strictType = props.type ? (Array.isArray(props.type) ? props.type : [props.type]) : [];
  const funcStrictType = (v: ProductEntity) => strictType.includes(v.type);

  return (
    <Selector
      {...rest}
      listRoute="/products"
      listParams={type ? { type } : undefined}
      onSearch={(q) =>
        searchEntity<ProductEntity>(AppEntity.PRODUCTS, q, {
          isStockCheck,
          type,
        }).then((res) => {
          if (strictType.length > 0) return res.filter(funcStrictType);
          return res;
        })
      }
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(product) => {
        const Icon = getProductIcon(product.type);

        return (
          <Combobox.Option value={product._id} key={product._id}>
            <Group gap={10}>
              <EntityImage
                src={product.image}
                icon={Icon}
                iconProps={{ strokeWidth: 1.2, size: 18 }}
                onlyRead
                size={em(30)}
              />

              <Text>{product.name}</Text>
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
            {t("add")}
          </Button>
        );
      }}
      onSelect={(e) => {
        if (!e) return;
        props.onSelect(e);
      }}
    />
  );
};
