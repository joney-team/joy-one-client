"use client";

import { EntityImage } from "@/components/entity-image";
import { useList } from "@/components/list/use-list";
import { ScrollArea } from "@/components/scroll-area";
import { api } from "@/modules/apis";
import { useQuery } from "@/modules/apis/use-query";
import { num, t } from "@/modules/lang/lang-service";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductEntity } from "@/modules/products/products-types";
import { SearchCustomer, SearchProduct, SearchResult } from "@/modules/search/search-types";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { Card, Group, Popover, Stack, Text, TextInput } from "@mantine/core";
import { useClickOutside, useThrottledValue } from "@mantine/hooks";
import { IconSearch, IconUserSquareRounded } from "@tabler/icons-react";
import { useEffect, useMemo, useState, type FC } from "react";
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

  const { data: searchResult } = useQuery<SearchResult>({
    isSkip: searchText.length === 0,
    route: "/search",
    params: {
      q: throttledSearchText,
      entities: [AppEntity.PRODUCTS, AppEntity.CUSTOMERS],
    },
  });

  const latestProducts = useList<ProductEntity>({
    id: "latest-products",
    params: {
      sortLastInteractionAt: -1,
    },
    fetch: (params) => api.get("/products", { params }),
  });

  const searchResultCount = useMemo(() => {
    return Object.keys(searchResult || {}).reduce((acc, entity) => {
      return acc + (searchResult?.[entity as keyof SearchResult]?.length || 0);
    }, 0);
  }, [searchResult]);

  const pointerData = useMemo<SearchProduct | SearchCustomer | null>(() => {
    if (pointerIndex === null) return null;
    const flatSearchResult = Object.values(searchResult || {}).flat();
    return flatSearchResult[pointerIndex] || null;
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
          if (pointerData._entity === AppEntity.PRODUCTS) {
            orderSale.addProduct(pointerData);
          }

          if (pointerData._entity === AppEntity.CUSTOMERS) {
            orderSale.updateOrder({ relatedCustomer: pointerData });
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
              placeholder={t("order_sale_search_placeholder")}
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
            {Object.keys(searchResult || {}).map((entity) => {
              const data = searchResult?.[entity as keyof SearchResult];
              if (!data || data.length === 0) return null;

              return (
                <Stack key={entity} gap={0} miw={searchBoxWidth}>
                  {data.map((result) => {
                    if (entity === AppEntity.PRODUCTS) {
                      const product = result as SearchProduct;
                      const isPointer = pointerData?._id === product._id;
                      return (
                        <Card
                          key={result._id}
                          shadow="none"
                          withBorder={false}
                          p={8}
                          radius={0}
                          bg={isPointer ? "primary.0" : "transparent"}
                          className="clickable"
                          onClick={() => orderSale.addProduct(product)}
                        >
                          <Group>
                            <EntityImage
                              src={product.image}
                              size={40}
                              icon={getProductIcon(product.type)}
                            />
                            <Stack gap={3}>
                              <Text>{product.name}</Text>
                              <Text fz={12}>
                                {(function () {
                                  if (
                                    typeof product.minPrice === "number" &&
                                    typeof product.maxPrice === "number"
                                  )
                                    return `${num(product.minPrice, { type: "money" })} - ${num(
                                      product.maxPrice,
                                      {
                                        type: "money",
                                      }
                                    )}`;
                                  return num(product.price, { type: "money" });
                                })()}{" "}
                                / {product.unit}
                              </Text>
                            </Stack>
                          </Group>
                        </Card>
                      );
                    }

                    if (entity === AppEntity.CUSTOMERS) {
                      const customer = result as SearchCustomer;
                      const isPointer = pointerData?._id === customer._id;
                      return (
                        <Card
                          key={result._id}
                          shadow="none"
                          withBorder={false}
                          p={8}
                          radius={0}
                          bg={isPointer ? "primary.0" : "transparent"}
                          className="clickable"
                          onClick={() => orderSale.updateOrder({ relatedCustomer: customer })}
                        >
                          <Group>
                            <EntityImage
                              src={customer.avatar}
                              size={40}
                              icon={IconUserSquareRounded}
                            />
                            <Stack gap={3}>
                              <Text>{customer.name}</Text>
                              <Text fz={12}>{customer.phone}</Text>
                            </Stack>
                          </Group>
                        </Card>
                      );
                    }
                  })}
                </Stack>
              );
            })}

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
                        onClick={() => orderSale.addProduct(product)}
                      >
                        <Group>
                          <EntityImage
                            src={product.image}
                            size={40}
                            icon={getProductIcon(product.type)}
                          />
                          <Stack gap={3}>
                            <Text>{product.name}</Text>
                            <Text fz={12}>
                              {(function () {
                                if (
                                  typeof product.minPrice === "number" &&
                                  typeof product.maxPrice === "number"
                                )
                                  return `${num(product.minPrice, { type: "money" })} - ${num(
                                    product.maxPrice,
                                    {
                                      type: "money",
                                    }
                                  )}`;
                                return num(product.price, { type: "money" });
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
