"use client";

import { EntityImage } from "@/components/entity-image";
import { CurrencyFormat } from "@/components/format/currency-format";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { ScrollArea } from "@/components/scroll-area";
import { ProductFragment } from "@/modules/products/graphql/fragmentProduct.graphql";
import GetProductsDocument from "@/modules/products/graphql/getProducts.graphql";
import { productTypes } from "@/modules/products/products-constants";
import SearchDocument from "@/modules/search/graphql/search.graphql";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { useLazyQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Card, Group, Popover, Stack, Text, TextInput } from "@mantine/core";
import { useClickOutside, useThrottledValue } from "@mantine/hooks";
import { IconSearch, IconUserSquareRounded } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState, type FC } from "react";
import { userOrdersManagement } from "../../orders-management/orders-management-context";

const searchBoxWidth = 400;

export const OrderSaleSearchBox: FC = () => {
  const color = useColor();
  const orderSale = userOrdersManagement();
  const [isOpened, setIsOpened] = useState(false);
  const ref = useClickOutside(() => setIsOpened(false));

  const [pointerIndex, setPointerIndex] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const throttledSearchText = useThrottledValue(searchText, 300);

  const [searchQuery, { data: searchResult }] = useLazyQuery(SearchDocument, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (throttledSearchText.length > 0) {
      searchQuery({
        variables: {
          query: throttledSearchText,
          entities: [AppEntity.PRODUCTS, AppEntity.CUSTOMERS],
        },
      });
    }
  }, [throttledSearchText]);

  const latestProducts = useGraphqlList<ProductFragment>({
    id: "latest-products",
    query: GetProductsDocument,
    params: {
      sortLastInteractionAt: -1,
    },
  });

  const searchResultCount = useMemo(() => {
    return searchResult?.search.length ?? 0;
  }, [searchResult]);

  const pointerData = useMemo(() => {
    if (!pointerIndex) return null;
    return (searchResult?.search ?? [])[pointerIndex] || null;
  }, [pointerIndex, searchResult]);

  useEffect(() => {
    if (searchResultCount > 0) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown" && pointerIndex !== searchResultCount - 1) {
          setPointerIndex(pointerIndex === null ? 0 : pointerIndex + 1);
        }

        if (e.key === "ArrowUp" && pointerIndex !== null) {
          setPointerIndex(pointerIndex === 0 ? null : pointerIndex - 1);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Enter" && pointerData) {
          if (pointerData.__typename === "SearchResultProduct") {
            orderSale.addProduct({
              ...pointerData,
              __typename: "OrderItemProduct",
              _id: pointerData.id,
              code: pointerData.productCode,
              type: pointerData.productType,
            });
          }

          if (pointerData.__typename === "SearchResultCustomer") {
            orderSale.updateOrder({
              relatedCustomer: {
                ...pointerData,
                __typename: "Customer",
                _id: pointerData.id,
                code: pointerData.customerCode,
              },
            });
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [pointerIndex, searchResultCount, pointerData, orderSale]);

  return (
    <Card shadow="none" p={0} withBorder={false} maw="100%" radius="sm" pl={10} ref={ref}>
      <Group gap={5}>
        <IconSearch size={18} strokeWidth={1.5} color={color("gray")} />

        <Popover opened={isOpened} shadow="lg">
          <Popover.Target>
            <TextInput
              miw={searchBoxWidth}
              value={searchText}
              placeholder={t`Search products / services / customers`}
              onClick={() => {
                if (!isOpened) setIsOpened(true);
              }}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (pointerIndex !== null) setPointerIndex(null);
              }}
              variant="unstyled"
            />
          </Popover.Target>

          <Popover.Dropdown p={0} miw={searchBoxWidth} style={{ overflow: "hidden" }}>
            {searchResult && searchResult.search.length > 0 && (
              <Stack gap={0} miw={searchBoxWidth}>
                {searchResult.search.map((result) => {
                  if (result.__typename === "SearchResultProduct") {
                    const isPointer = pointerData?.id === result.id;
                    return (
                      <Card
                        key={result.id}
                        shadow="none"
                        withBorder={false}
                        p={8}
                        radius={0}
                        bg={isPointer ? "primary.0" : "transparent"}
                        className="clickable"
                        onClick={() => {
                          orderSale.addProduct({
                            ...result,
                            __typename: "OrderItemProduct",
                            type: result.productType,
                            code: result.productCode,
                            _id: result.id,
                          });
                        }}
                      >
                        <Group>
                          <EntityImage
                            src={result.image}
                            size={40}
                            icon={productTypes[result.productType].icon}
                          />
                          <Stack gap={3}>
                            <Text>{result.name}</Text>
                            <Text fz={12}>
                              {(function () {
                                if (
                                  typeof result.minPrice === "number" &&
                                  typeof result.maxPrice === "number"
                                ) {
                                  return (
                                    <Fragment>
                                      <CurrencyFormat value={result.minPrice} /> -{" "}
                                      <CurrencyFormat value={result.maxPrice} />
                                    </Fragment>
                                  );
                                }

                                return <CurrencyFormat value={result.price} />;
                              })()}{" "}
                              / {result.unit}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    );
                  }

                  if (result.__typename === "SearchResultCustomer") {
                    const isPointer = pointerData?.id === result.id;
                    return (
                      <Card
                        key={result.id}
                        shadow="none"
                        withBorder={false}
                        p={8}
                        radius={0}
                        bg={isPointer ? "primary.0" : "transparent"}
                        className="clickable"
                        onClick={() =>
                          orderSale.updateOrder({
                            relatedCustomer: {
                              ...result,
                              __typename: "Customer",
                              _id: result.id,
                              code: result.customerCode,
                            },
                          })
                        }
                      >
                        <Group>
                          <EntityImage src={result.avatar} size={40} icon={IconUserSquareRounded} />
                          <Stack gap={3}>
                            <Text>{result.name}</Text>
                            {result.phone && <Text fz={12}>{result.phone}</Text>}
                          </Stack>
                        </Group>
                      </Card>
                    );
                  }
                })}
              </Stack>
            )}

            {searchText.length === 0 && (
              <ScrollArea
                h="50dvh"
                onBottomReached={
                  latestProducts.isAbleToLoadMore ? latestProducts.loadMore : undefined
                }
              >
                <Stack gap={0}>
                  {latestProducts.data.map((product) => {
                    return (
                      <Card
                        key={product._id}
                        shadow="none"
                        withBorder={false}
                        p={8}
                        radius={0}
                        className="clickable"
                        onClick={() =>
                          orderSale.addProduct({
                            ...product,
                            __typename: "OrderItemProduct",
                          })
                        }
                      >
                        <Group>
                          <EntityImage
                            src={product.image}
                            size={40}
                            icon={productTypes[product.type].icon}
                          />
                          <Stack gap={3}>
                            <Text>{product.name}</Text>
                            <Text fz={12}>
                              {(function () {
                                if (
                                  typeof product.minPrice === "number" &&
                                  typeof product.maxPrice === "number"
                                )
                                  return (
                                    <Fragment>
                                      <CurrencyFormat value={product.minPrice} /> -{" "}
                                      <CurrencyFormat value={product.maxPrice} />
                                    </Fragment>
                                  );
                                return <CurrencyFormat value={product.price} />;
                              })()}{" "}
                              / {product.unit}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Card>
  );
};
