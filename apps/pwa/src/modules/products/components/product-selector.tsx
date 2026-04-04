"use client";

import { Button } from "@/components/buttons/button";
import { EntityImage } from "@/components/entity-image";
import { Selector, SelectorContext, SelectorProps } from "@/components/selector";
import { ProductType } from "@/graphql/enums.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { Trans } from "@lingui/react/macro";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { ProductFragment } from "../graphql/fragmentProduct.graphql";
import GetProductsDocument from "../graphql/getProducts.graphql";
import { productTypes } from "../products-constants";

interface ProductSelectorProps extends Omit<
  SelectorProps<ProductFragment>,
  "onSelect" | "onSearch" | "renderOption" | "target"
> {
  type?: ProductType | ProductType[];
  isStockCheck?: boolean;
  onSelect: (value: ProductFragment) => void;
  target?: (ctx: SelectorContext<ProductFragment>) => ReactNode;
}

export const ProductSelector: FC<ProductSelectorProps> = (props) => {
  const { type, isStockCheck, excludeIds, onSelect, target, ...rest } = props;
  const strictType = props.type ? (Array.isArray(props.type) ? props.type : [props.type]) : [];
  const funcStrictType = (v: ProductFragment) => strictType.includes(v.type);

  return (
    <Selector
      {...rest}
      listQuery={GetProductsDocument}
      listParams={type ? { type } : undefined}
      onSearch={(q) =>
        searchEntity<ProductFragment>(AppEntity.PRODUCTS, q, {
          isStockCheck,
          type,
        }).then((res) => {
          if (strictType.length > 0) return res.filter(funcStrictType);
          return res;
        })
      }
      renderOption={(product) => {
        const { icon: Icon } = productTypes[product.type as ProductType];

        return (
          <Combobox.Option value={product._id} key={product._id}>
            <Group gap={10} wrap="nowrap">
              <EntityImage
                src={product.image}
                icon={Icon}
                iconProps={{ strokeWidth: 1.2, size: 18 }}
                readonly
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
            onClick={toggle}
          >
            <Trans>Add</Trans>
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
