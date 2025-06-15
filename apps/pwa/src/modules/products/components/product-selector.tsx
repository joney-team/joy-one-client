import { AppEntity } from "@/types";
import { Button } from "@/components/buttons/button";
import { EntityImage } from "@/components/entity-image";
import { t } from "@/modules/lang/lang-service";
import { getProductIcon, getProducts } from "@/modules/products/products-service";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { searchEntity } from "@/modules/search/search-service";
import { em, Group, InputWrapperProps, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "@/components/selector";

interface ProductSelectorProps {
  type?: ProductType | ProductType[];
  isStockCheck?: boolean;
  excludeIds?: string[];
  onSelect: (value: ProductEntity) => void;
  renderTrigger?: (ctx: SelectorContext<ProductEntity>) => ReactNode;
  props?: InputWrapperProps;
}

export const ProductSelector: FC<ProductSelectorProps> = (props) => {
  const strictType = Array.isArray(props.type) ? props.type : [props.type];
  const funcStrictType = (v: ProductEntity) => strictType.includes(v.type);

  return (
    <Selector
      {...props.props}
      excludeIds={props.excludeIds}
      onSearch={(q) =>
        searchEntity<ProductEntity>(AppEntity.PRODUCTS, q, {
          isStockCheck: props.isStockCheck,
          type: props.type,
        }).then((res) => {
          if (strictType.length > 0) return res.filter(funcStrictType);
          return res;
        })
      }
      onInitOptions={() =>
        getProducts({ type: props.type, limit: 5 }).then((res) => res.data.filter(funcStrictType))
      }
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOptionChild={(product) => {
        const Icon = getProductIcon(product.type);

        return (
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
        );
      }}
      renderTarget={(ctx) => {
        const { toggle } = ctx;
        if (props.renderTrigger) return props.renderTrigger(ctx);
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
