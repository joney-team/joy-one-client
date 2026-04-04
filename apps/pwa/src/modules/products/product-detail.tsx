"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { NumberFormat } from "@/components/format/number-format";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { EventType, ProductStockRecordType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { ModalProductStockOut } from "@/modules/product-stocks/modals/modal-product-stock-out";
import { ProductCard } from "@/modules/products/components/product-card";
import { userColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
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
import { ModalProductStockIn } from "../product-stocks/modals/modal-product-stock-in";
import { productStockRecordTypes } from "../product-stocks/product-stocks-constants";

import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useEventsListener } from "../events/event-service";
import GetOrderByIdDocument from "../orders/graphql/getOrderById.graphql";
import { ProductStockFragment } from "../product-stocks/graphql/fragmentProductStock.graphql";
import { ProductStockRecordFragment } from "../product-stocks/graphql/fragmentProductStockRecord.graphql";
import GetProductStockRecordsDocument from "../product-stocks/graphql/getProductStockRecords.graphql";
import GetProductStocksDocument from "../product-stocks/graphql/getProductStocks.graphql";
import { ProductColumn } from "./components/product-column";
import ArchiveProductDocument from "./graphql/archiveProduct.graphql";
import GetProductByIdDocument from "./graphql/getProductById.graphql";

const events = [
  EventType.ProductNew,
  EventType.ProductUpdate,
  EventType.ProductArchived,

  EventType.ProductStockIn,
  EventType.ProductStockInRevert,
  EventType.ProductStockOut,
  EventType.ProductStockOutRevert,
  EventType.ProductStockInMultiple,
];

export const ProductDetail: FC = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const client = useApolloClient();
  const params = useParams<{ id: string }>();
  const { t } = useLingui();

  const router = useRouter();
  const productId = params.id;

  const { data, loading, error, refetch } = useQuery(GetProductByIdDocument, {
    variables: {
      productId,
    },
  });

  useEventsListener(events, (e) => {
    if (e.ref === productId) {
      refetch();
    }
  });

  useEffect(() => {
    if (data?.product) {
      layout.setComponents({
        head: data.product.name,
      });
    }
  }, [data?.product]);

  return (
    <Container size="md" p="md">
      <Stack gap={30}>
        {loading && <Skeleton height={200} />}
        {error && <Errored error={error} />}
        {data?.product && (
          <Fragment>
            <ProductCard product={data.product} preventLink imageSize={120} />

            {data.product.isStockCheck && (
              <Fragment>
                <ModalProductStockIn>
                  {(openModalStockIn) => (
                    <ModalProductStockOut>
                      {(openProductStockOut) => (
                        <List<ProductStockFragment>
                          id={`product-stocks-${productId}`}
                          icon={IconBuildingWarehouse}
                          name="product_stocks"
                          query={GetProductStocksDocument}
                          fixedParams={{ productId, sortExpireAt: 1 }}
                          columns={{
                            createdAt: dateTimeColumn({ sortable: true, name: "time" }),
                            code: { name: "product_stock_code", filter: { text: true } },
                            createdByUser: userColumn({
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
                            onCreate: () => openModalStockIn({ product: data.product }),
                            permission: WorkspacePermission.PRODUCT_STOCK_IN,
                            label: `product_stock_record_type_${ProductStockRecordType.StockIn}`,
                          }}
                          events={events}
                          actions={[
                            {
                              label: t(
                                productStockRecordTypes[ProductStockRecordType.StockOut].label,
                              ),
                              icon: productStockRecordTypes[ProductStockRecordType.StockOut].icon,
                              onClick: (data) => openProductStockOut({ stock: data }),
                              disabled: (data) => data.remainQuantity <= 0,
                            },
                          ]}
                        />
                      )}
                    </ModalProductStockOut>
                  )}
                </ModalProductStockIn>

                <List<ProductStockRecordFragment>
                  id={`product-stock-records-${productId}`}
                  icon={IconArrowLeftRight}
                  name="history"
                  query={GetProductStockRecordsDocument}
                  fixedParams={{ productId }}
                  columns={{
                    createdAt: dateTimeColumn(),
                    type: enumColumn({
                      icon: IconBox,
                      options: Object.values(ProductStockRecordType).map((type) => ({
                        label: t(productStockRecordTypes[type].label),
                        value: type,
                        color: productStockRecordTypes[type].color,
                        icon: productStockRecordTypes[type].icon,
                      })),
                    }),
                    stockCode: { name: t`Stock code` },
                    createdByUser: userColumn({
                      name: t`Member`,
                      valuePath: "createdByUser",
                    }),
                    relatedOrderId: {
                      name: t`Order`,
                      icon: IconClipboardText,
                      render: ({ data }) => {
                        if (!data.relatedOrderId) return "-";

                        const { data: orderData } = useQuery(GetOrderByIdDocument, {
                          variables: {
                            orderId: data.relatedOrderId,
                          },
                        });

                        return (
                          <Anchor
                            c="dark"
                            component={Link}
                            href={`/orders/${orderData?.order?.code}`}
                          >
                            #{orderData?.order?.code || "--"}
                          </Anchor>
                        );
                      },
                    },
                    relatedProduct: ProductColumn({
                      name: <Trans>Products/Services related</Trans>,
                    }),
                    quantity: numberColumn({ name: <Trans>Quantity</Trans> }),
                    note: { defaultHidden: true },
                  }}
                  events={events}
                />
              </Fragment>
            )}

            {data.product && (
              <ButtonArchive
                enabled={workspace.hasPermission(WorkspacePermission.PRODUCTS_SERVICES_WRITE)}
                process={() =>
                  onArchive({
                    name: data.product?.name,
                    process: async () => {
                      await client.mutate({
                        mutation: ArchiveProductDocument,
                        variables: { productId: data.product?._id },
                      });
                      router.back();
                    },
                  })
                }
              />
            )}
          </Fragment>
        )}
      </Stack>
    </Container>
  );
};
