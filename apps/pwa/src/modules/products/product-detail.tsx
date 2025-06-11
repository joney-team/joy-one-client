import { ButtonArchive } from "@/components/buttons/button-archive";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { NumberColumn } from "@/components/list/columns/number-column";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
import { num, t, tMulti } from "@/modules/lang/lang-service";
import { getOrderById } from "@/modules/orders/orders-service";
import { OnModalProductStockIn } from "@/modules/product-stocks/modals/modal-product-stock-in";
import { OnModalProductStockOut } from "@/modules/product-stocks/modals/modal-product-stock-out";
import { productStockRecordTypeOptions } from "@/modules/product-stocks/product-stocks-service";
import { ProductStockRecordType } from "@/modules/product-stocks/product-stocks-types";
import { ProductCard } from "@/modules/products/product-card";
import { ProductColumn } from "@/modules/products/product-column";
import { archiveProduct, getProduct } from "@/modules/products/products-service";
import { UserColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { Anchor, Skeleton, Stack, Text } from "@mantine/core";
import {
  IconArrowLeftRight,
  IconArrowUpRight,
  IconBox,
  IconBuildingWarehouse,
  IconClipboardText,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FC, useEffect } from "react";
import {
  ProductStockEntity,
  ProductStockRecordEntity,
} from "../product-stocks/product-stocks-entity";

const events = [
  EventType.PRODUCT_NEW,
  EventType.PRODUCT_UPDATE,
  EventType.PRODUCT_ARCHIVED,

  EventType.PRODUCT_STOCK_IN,
  EventType.PRODUCT_STOCK_IN_REVERT,
  EventType.PRODUCT_STOCK_OUT,
  EventType.PRODUCT_STOCK_OUT_REVERT,
  EventType.PRODUCT_STOCK_IN_MULTIPLE,
];

export const ProductDetail: FC = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const params = useParams();

  const router = useRouter();
  const productId = params.id as string;

  const product = useFetch({
    id: `products-${productId}`,
    fetch: async () => getProduct(productId),
    events: {
      types: events,
      condition: (e, _product) =>
        e.ref === _product._id || (e.relatedEntities || []).some((v) => v.id === _product._id),
    },
  });

  useEffect(() => {
    if (product.data) {
      layout.setComponents({
        head: product.data.name,
      });
    }
  }, [product.data]);

  return (
    <Container size="xl" p={16}>
      <Stack gap={30}>
        {!product.isInitialized && <Skeleton height={200} />}
        {!!product.error && <Errored error={product.error} />}
        {product.data && (
          <>
            <ProductCard product={product.data} preventLink imageSize={120} />

            {product.data.isStockCheck && (
              <>
                <List<ProductStockEntity>
                  id={`product-stocks-${productId}`}
                  icon={IconBuildingWarehouse}
                  name="product_stocks"
                  route="/product-stocks"
                  params={{ productId, sortExpireAt: 1 }}
                  columns={{
                    createdAt: DateTimeColumn({ isSortable: true, name: "time" }),
                    code: { name: "product_stock_code", filter: { text: true } },
                    createdByUserId: UserColumn({
                      name: "member",
                      valuePath: "createdByUser",
                    }),
                    quantity: {
                      isSortable: true,
                      render: ({ data }) => {
                        return (
                          <Text>
                            {num(data.remainQuantity)} / {num(data.quantity)}
                          </Text>
                        );
                      },
                    },
                    expireAt: DateTimeColumn({
                      name: "expire_at",
                      emptyText: "--",
                      hideTime: true,
                      isFromNow: true,
                    }),
                    costPrice: NumberColumn({ name: "costPrice", type: "money" }),
                    note: { isDefaultHide: true },
                  }}
                  creatable={{
                    onCreate: () => OnModalProductStockIn({ product: product.data }),
                    permission: WorkspacePermission.PRODUCT_STOCK_IN,
                    label: `product_stock_record_type_${ProductStockRecordType.STOCK_IN}`,
                  }}
                  events={events}
                  actions={[
                    {
                      label: t(`product_stock_record_type_${ProductStockRecordType.STOCK_OUT}`),
                      icon: IconArrowUpRight,
                      onClick: (data) => OnModalProductStockOut({ stock: data }),
                      disabled: (data) => data.remainQuantity <= 0,
                    },
                  ]}
                />

                <List<ProductStockRecordEntity>
                  id={`product-stock-records-${productId}`}
                  icon={IconArrowLeftRight}
                  name="history"
                  route="/product-stock-records"
                  params={{ productId }}
                  columns={{
                    createdAt: DateTimeColumn(),
                    type: EnumColumn({
                      icon: IconBox,
                      options: Object.values(ProductStockRecordType).map((type) => ({
                        label: t(`product_stock_record_type_${type}`),
                        value: type,
                        color: productStockRecordTypeOptions[type].color,
                        icon: productStockRecordTypeOptions[type].icon,
                      })),
                    }),
                    stockCode: { name: "product_stock_code" },
                    createdByUserId: UserColumn({
                      name: "member",
                      valuePath: "createdByUser",
                    }),
                    relatedOrderId: {
                      name: "order",
                      icon: IconClipboardText,
                      render: ({ data }) => {
                        if (!data.relatedOrderId) return "-";
                        const order = useFetch({
                          id: `orders-${data.relatedOrderId}`,
                          fetch: async () => getOrderById(data.relatedOrderId!),
                        });

                        return (
                          <Anchor c="dark" component={Link} href={`/orders/${order.data?.code}`}>
                            #{order.data?.code || "--"}
                          </Anchor>
                        );
                      },
                    },
                    relatedProductId: ProductColumn({
                      valuePath: "relatedProduct",
                      name: t("entity_related", {
                        entity: tMulti(["products"], ["/"], ["services"]),
                      }),
                    }),
                    quantity: NumberColumn({ name: "quantity" }),
                    note: { isDefaultHide: true },
                  }}
                  events={events}
                />
              </>
            )}

            <ButtonArchive
              enabled={workspace.hasPermission(WorkspacePermission.PRODUCTS_SERVICES_WRITE)}
              process={() =>
                onArchive({
                  process: () => archiveProduct(productId),
                  onArchived: () => router.back(),
                })
              }
            />
          </>
        )}
      </Stack>
    </Container>
  );
};
