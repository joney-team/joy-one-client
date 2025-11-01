"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
import { getOrderById } from "@/modules/orders/orders-service";
import { OnModalProductStockIn } from "@/modules/product-stocks/modals/modal-product-stock-in";
import { OnModalProductStockOut } from "@/modules/product-stocks/modals/modal-product-stock-out";
import { ProductStockRecordType } from "@/modules/product-stocks/product-stocks-types";
import { ProductCard } from "@/modules/products/components/product-card";
import { ProductColumn } from "@/modules/products/components/product-column";
import { archiveProduct, getProduct } from "@/modules/products/products-service";
import { UserColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Anchor, Skeleton, Stack, Text } from "@mantine/core";
import {
  IconArrowLeftRight,
  IconBox,
  IconBuildingWarehouse,
  IconClipboardText,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FC, Fragment, useEffect } from "react";
import { productStockRecordTypes } from "../product-stocks/product-stocks-constants";
import {
  ProductStockEntity,
  ProductStockRecordEntity,
} from "../product-stocks/product-stocks-entity";
import { NumberFormat } from "@/components/format/number-format";

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
    refetchEvents: {
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
    <Container size="md" p={16}>
      <Stack gap={30}>
        {!product.isInitialized && <Skeleton height={200} />}
        {!!product.error && <Errored error={product.error} />}
        {product.data && (
          <Fragment>
            <ProductCard product={product.data} preventLink imageSize={120} />

            {product.data.isStockCheck && (
              <Fragment>
                <List<ProductStockEntity>
                  id={`product-stocks-${productId}`}
                  icon={IconBuildingWarehouse}
                  name="product_stocks"
                  route="/product-stocks"
                  params={{ productId, sortExpireAt: 1 }}
                  columns={{
                    createdAt: dateTimeColumn({ sortable: true, name: "time" }),
                    code: { name: "product_stock_code", filter: { text: true } },
                    createdByUserId: UserColumn({
                      name: "member",
                      valuePath: "createdByUser",
                    }),
                    quantity: {
                      sortable: true,
                      render: ({ data }) => {
                        return (
                          <Text>
                            <NumberFormat value={data.remainQuantity} /> /{" "}
                            <NumberFormat value={data.quantity} />
                          </Text>
                        );
                      },
                    },
                    expireAt: dateTimeColumn({
                      name: "expire_at",
                      emptyText: "--",
                      hideTime: true,
                      isShowRelativeTime: true,
                    }),
                    costPrice: numberColumn({ name: "costPrice", type: "money" }),
                    note: { defaultHidden: true },
                  }}
                  creatable={{
                    onCreate: () => OnModalProductStockIn({ product: product.data }),
                    permission: WorkspacePermission.PRODUCT_STOCK_IN,
                    label: `product_stock_record_type_${ProductStockRecordType.STOCK_IN}`,
                  }}
                  events={events}
                  actions={[
                    {
                      label: productStockRecordTypes[ProductStockRecordType.STOCK_OUT].label(),
                      icon: productStockRecordTypes[ProductStockRecordType.STOCK_OUT].icon,
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
                    createdAt: dateTimeColumn(),
                    type: enumColumn({
                      icon: IconBox,
                      options: Object.values(ProductStockRecordType).map((type) => ({
                        label: productStockRecordTypes[type].label(),
                        value: type,
                        color: productStockRecordTypes[type].color,
                        icon: productStockRecordTypes[type].icon,
                      })),
                    }),
                    stockCode: { name: t`Stock code` },
                    createdByUserId: UserColumn({
                      name: t`Member`,
                      valuePath: "createdByUser",
                    }),
                    relatedOrderId: {
                      name: t`Order`,
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
                      name: t`Products/Services related`,
                    }),
                    quantity: numberColumn({ name: t`Quantity` }),
                    note: { defaultHidden: true },
                  }}
                  events={events}
                />
              </Fragment>
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
          </Fragment>
        )}
      </Stack>
    </Container>
  );
};
