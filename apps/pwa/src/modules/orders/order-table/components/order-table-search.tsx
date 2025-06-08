import { EntityImage } from "@/components/entity-image";
import { TextInput } from "@/components/inputs/text-input";
import { num, t } from "@/modules/lang/lang-service";
import { getProduct, getProductIcon } from "@/modules/products/products-service";
import { ProductEntity } from "@/modules/products/products-types";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { ActionIcon, Card, Combobox, Group, Loader, Stack, Text, useCombobox } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";
import { useOrderTable } from "../order-table-context";

export const OrderTableSearch: FC = () => {
  const orderForm = useOrderTable();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<ProductEntity[]>([]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const onSearch = useDebouncedCallback(async (q?: string) => {
    try {
      if (q && q.length > 0) {
        setIsSearching(true);
        const result = await searchEntity(AppEntity.PRODUCTS, q);
        const products = await Promise.all(result.map(async (item) => getProduct(item._id)));
        setSearchResult(products);
        if (products.length > 0) combobox.openDropdown();
      } else {
        setIsSearching(false);
        setSearchResult([]);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const onClearSearch = () => {
    setIsSearching(false);
    setSearchResult([]);

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const product = searchResult.find((p) => p._id === val);
        if (product) orderForm.addProduct(product);
      }}
    >
      <Combobox.Target>
        <Card shadow="none" p={0} withBorder={false} pl={10} maw="100%" flex={1} radius={100}>
          <TextInput
            ref={searchInputRef}
            leftSection={
              isSearching ? <Loader size={16} strokeWidth={1.5} /> : <IconSearch size={22} strokeWidth={1.5} />
            }
            rightSection={
              searchInputRef.current?.value && (
                <ActionIcon variant="light" color="gray" radius={100} onClick={onClearSearch}>
                  <IconX size={16} strokeWidth={1.5} />
                </ActionIcon>
              )
            }
            placeholder={t("type_something_to_search")}
            onChange={(e) => {
              if (e.target.value.length > 0) setIsSearching(true);
              onSearch(e.target.value);
            }}
            onFocus={() => {
              if (searchResult.length > 0) combobox.openDropdown();
            }}
            styles={{
              input: {
                border: "none",
                height: 40,
              },
            }}
          />
        </Card>
      </Combobox.Target>

      {searchResult.length > 0 && (
        <Combobox.Dropdown>
          <Combobox.Options>
            {searchResult.map((product) => (
              <Combobox.Option key={product._id} value={product._id}>
                <Group>
                  <EntityImage src={product.image} size={40} icon={getProductIcon(product.type)} />

                  <Stack gap={3}>
                    <Text>{product.name}</Text>
                    <Text fz={12}>
                      {(function () {
                        if (typeof product.minPrice === "number" && typeof product.maxPrice === "number")
                          return `${num(product.minPrice, { type: "money" })} - ${num(product.maxPrice, {
                            type: "money",
                          })}`;
                        return num(product.price, { type: "money" });
                      })()}{" "}
                      / {product.unit}
                    </Text>
                  </Stack>
                </Group>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
};
