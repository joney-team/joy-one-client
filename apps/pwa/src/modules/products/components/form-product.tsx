"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Editor } from "@/components/editor";
import { ImageInput } from "@/components/inputs/image-input";
import { LaunchingSoon } from "@/components/launching-soon";
import { Renderer } from "@/components/renderer";
import { CategoryType } from "@/modules/categories/category-types";
import { CategoryInput } from "@/modules/categories/components/category-input";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { getCustomFieldValue } from "@/modules/custom-fields/custom-field-service";
import { tl } from "@/modules/lang/lang-service";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { archiveProduct, createProduct, updateProduct } from "@/modules/products/products-service";
import {
  ProductCombo,
  ProductEntity,
  ProductSupply,
  ProductType,
} from "@/modules/products/products-types";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import {
  ActionIcon,
  Card,
  Divider,
  em,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import {
  IconChartBar,
  IconCheck,
  IconMinus,
  IconNews,
  IconPlus,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { FC, useState } from "react";

export type FormProductProps = {
  onDone?: (product: ProductEntity) => void | Promise<void>;
} & (
  | {
      type: ProductType;
    }
  | {
      product: ProductEntity;
    }
);

const defaultUnitPerType: { [key in ProductType]?: string } = {
  [ProductType.COMBO]: "package",
  [ProductType.VOUCHER]: "voucher",
};

enum FormProductTab {
  SETTING = "SETTING",
  POST = "POST",
  ANALYTICS = "ANALYTICS",
}

const FormProductCombo: FC<{
  combo: ProductCombo;
  onChange: (combo: ProductCombo) => void;
  onRemove: () => void;
}> = (props) => {
  const { combo, onChange } = props;

  return (
    <Group wrap="nowrap" flex={1}>
      <ProductSelector
        type={[ProductType.PRODUCT, ProductType.SERVICE]}
        onSelect={(product) => onChange({ ...combo, product, productId: product._id })}
        target={(ctx) => {
          return (
            <TextInput
              flex={1}
              label={tl("product")}
              value={combo.product?.name}
              readOnly
              onClick={ctx.toggle}
            />
          );
        }}
      />

      <NumberInput
        label={tl("quantity")}
        value={combo.quantity}
        min={1}
        maw={100}
        onChange={(v) => onChange({ ...combo, quantity: +v })}
      />
    </Group>
  );
};

export const FormProduct: FC<
  FormProductProps & {
    onClose: () => void;
  }
> = (props) => {
  const [tab, setTab] = useState<FormProductTab>(FormProductTab.SETTING);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const product = "product" in props ? props.product : undefined;
  const type = ("type" in props ? props.type : product?.type) as ProductType;

  const [supplies, handlers] = useListState<ProductSupply>(product?.supplies || []);
  const [combos, combosHandler] = useListState(product?.combos || []);
  const [voucherIncludeProducts, voucherIncludeProductsHandler] = useListState(
    product?.voucherIncludeProducts || []
  );
  const [voucherExcludeProducts, voucherExcludeProductsHandler] = useListState(
    product?.voucherExcludeProducts || []
  );

  const form = useForm({
    initialValues: {
      ...product,
      type,
      unit: product?.unit || tl(defaultUnitPerType[type] || "") || "",
      isRangePrice: typeof product?.minPrice === "number",
    } as any,
    validate: {
      name: (value: string) => {
        if (!value) return tl("must_be_provided");
      },
      unit: (value: string) => {
        if (!value) return tl("must_be_provided");
      },
      price: (value: number, values: any) => {
        if (typeof value !== "number") return tl("must_be_provided");
        if (value < 0) return tl("validate_min_amount", { min: 0 });

        if (values.isRangePrice) {
          if (values.minPrice && values.minPrice > value)
            return tl("validate_range_price_with_default_price");
          if (values.maxPrice && values.maxPrice < value)
            return tl("validate_range_price_with_default_price");
        }
      },
      minPrice: (value: number, values: any) => {
        if (values.isRangePrice) {
          if (typeof value !== "number") return tl("must_be_provided");
          if (values.maxPrice && values.maxPrice < value)
            return tl("validate_min_price_with_max_price");
        }
      },
      maxPrice: (value: number, values: any) => {
        if (values.isRangePrice) {
          if (typeof value !== "number") return tl("must_be_provided");
          if (values.minPrice && values.minPrice > value)
            return tl("validate_max_price_with_min_price");
        }
      },
      voucherAmount: (value: number) => {
        if (type === ProductType.VOUCHER) {
          if (typeof value !== "number") return tl("must_be_provided");
          if (value < 0) return tl("validate_min_amount", { min: 0 });
        }
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      // Validate
      if (type === ProductType.COMBO) {
        if (combos.length === 0)
          throw new Error(`${tl("must_be_provided")} ${tl("products")}/${tl("services")}`);
      }

      const { customFields, ...rest } = values;

      let payload = {
        ...rest,
        categoryId: values.category?._id,
        supplies,
        combos: combos.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        voucherExcludeProductIds: voucherExcludeProducts.map((p) => p._id),
        voucherIncludeProductIds: voucherIncludeProducts.map((p) => p._id),
        customFieldValues: getCustomFieldValue(customFields),
      };

      if (!values.isRangePrice) delete payload.minPrice;

      const action = product
        ? () => updateProduct(product!._id, payload)
        : () => createProduct(payload);

      const res = await action();
      await props.onDone?.(res);
      props.onClose?.();
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack>
      <Stack>
        <Tabs value={tab} onChange={(value) => setTab(value as FormProductTab)} variant="outline">
          <Tabs.List>
            <Tabs.Tab value={FormProductTab.SETTING} fw={500}>
              <Group align="center" gap={5}>
                <IconSettings size={16} strokeWidth={1.5} />
                {tl("settings")}
              </Group>
            </Tabs.Tab>
            <Tabs.Tab value={FormProductTab.POST} fw={500}>
              <Group align="center" gap={5}>
                <IconNews size={16} strokeWidth={1.5} />
                {tl("post")}
              </Group>
            </Tabs.Tab>
            <Tabs.Tab value={FormProductTab.ANALYTICS} fw={500} disabled={!product?._id}>
              <Group align="center" gap={5}>
                <IconChartBar size={16} strokeWidth={1.5} />
                {tl("analytics")}
              </Group>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={FormProductTab.SETTING} pt={16}>
            <SimpleGrid cols={{ md: 2 }} spacing={30}>
              <Stack>
                <ImageInput {...form.getInputProps("image")} w={150} h={150} />

                <TextInput withAsterisk label={tl("name")} {...form.getInputProps("name")} />
                <TextInput withAsterisk label={tl("unit")} {...form.getInputProps("unit")} />

                <TextInput label={tl("code")} {...form.getInputProps("code")} />

                <Renderer visible={type === ProductType.PRODUCT}>
                  <NumberInput
                    label={tl("min_per_use")}
                    description={tl("default_is", { value: 1 })}
                    {...form.getInputProps("defaultQtyPerUse")}
                    hideControls
                  />
                </Renderer>

                <Switch
                  label={tl("range_price")}
                  checked={form.values.isRangePrice}
                  onChange={(e) => form.setFieldValue("isRangePrice", e.target.checked)}
                />

                <Renderer visible={form.values.isRangePrice}>
                  <Group wrap="nowrap" align="start">
                    <NumberInput
                      withAsterisk
                      label={tl("min_price")}
                      flex={1}
                      hideControls
                      {...form.getInputProps("minPrice")}
                    />
                    <NumberInput
                      withAsterisk
                      label={tl("max_price")}
                      onBlur={() => {
                        if (
                          typeof form.values.maxPrice === "number" &&
                          typeof form.values.minPrice === "number" &&
                          !form.values.price
                        ) {
                          const middlePrice = (form.values.minPrice + form.values.maxPrice) / 2;
                          if (middlePrice >= 0) form.setFieldValue("price", middlePrice);
                        }
                      }}
                      flex={1}
                      hideControls
                      {...form.getInputProps("maxPrice")}
                    />
                  </Group>
                </Renderer>

                <NumberInput
                  label={tl("default_price")}
                  withAsterisk
                  hideControls
                  {...form.getInputProps("price")}
                />

                <Renderer visible={type === ProductType.VOUCHER}>
                  <NumberInput
                    withAsterisk
                    label={tl("voucherAmount")}
                    hideControls
                    {...form.getInputProps("voucherAmount")}
                  />
                </Renderer>

                <CategoryInput
                  label={tl("categories")}
                  {...form.getInputProps("category")}
                  type={CategoryType.PRODUCTS}
                />
              </Stack>

              <Stack>
                <Stack>
                  <Divider mb={-10} label={tl("settings")} labelPosition="left" fw={700} />

                  <TextInput
                    label={tl("display_name")}
                    description={tl("product_display_name_desc")}
                    {...form.getInputProps("displayName")}
                  />

                  <Switch
                    label={tl("product_hide_ticket")}
                    checked={form.values.isHiddenInReceiptWhenNoPrice}
                    styles={{ label: { fontSize: 14 } }}
                    {...form.getInputProps("isHiddenInReceiptWhenNoPrice")}
                  />

                  <Renderer visible={type === ProductType.PRODUCT}>
                    <Switch
                      label={tl("product_stock_check")}
                      checked={form.values.isStockCheck}
                      styles={{ label: { fontSize: 14 } }}
                      {...form.getInputProps("isStockCheck")}
                    />

                    <Renderer visible={form.values.isStockCheck}>
                      <NumberInput
                        label={tl("label_warning_out_of_date")}
                        description={tl("label_warning_out_of_date_desc")}
                        hideControls
                        {...form.getInputProps("warningOutOfDateBeforeDays")}
                      />

                      <NumberInput
                        label={tl("label_warning_out_of_stock")}
                        description={tl("label_warning_out_of_stock_desc")}
                        {...form.getInputProps("warningOutOfStockQty")}
                        hideControls
                      />
                    </Renderer>
                  </Renderer>
                </Stack>

                <Renderer visible={[ProductType.PRODUCT, ProductType.SERVICE].includes(type)}>
                  <Stack>
                    <Divider
                      mb={-10}
                      label={tl("product_supplies")}
                      labelPosition="left"
                      fw={700}
                    />
                    <Text fz={em(10)} c="gray">
                      {tl("enter_product_supplies")}
                    </Text>

                    <Stack gap={10}>
                      {supplies.map((supply, index) => {
                        return (
                          <Card key={index} py={5} px={8} withBorder>
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap={5}>
                                <Text fz={em(13)} fw={400}>
                                  {supply.product.name}
                                </Text>
                                <Text fz={em(10)} fw={400}>
                                  ({supply.product.unit})
                                </Text>
                              </Group>

                              <Group gap={5}>
                                <NumberInput
                                  maw={100}
                                  size="xs"
                                  placeholder={tl("amount")}
                                  min={0}
                                  value={supply.quantity}
                                  onChange={(e) =>
                                    handlers.setItem(index, { ...supply, quantity: +e })
                                  }
                                />

                                <ActionIcon
                                  color="gray"
                                  variant="transparent"
                                  onClick={() => handlers.remove(index)}
                                >
                                  <IconMinus size={16} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          </Card>
                        );
                      })}

                      <Group mt={5}>
                        <ProductSelector
                          type={[ProductType.PRODUCT]}
                          excludeIds={[...supplies.map((s) => s.productId), product?._id || ""]}
                          onSelect={(product) => {
                            handlers.append({
                              productId: product._id,
                              product,
                              quantity: product.defaultQtyPerUse || 1,
                            });
                          }}
                          target={(ctx) => {
                            return (
                              <Button
                                onClick={ctx.toggle}
                                tt="capitalize"
                                size="xs"
                                variant="light"
                                radius={100}
                                leftIcon={IconPlus}
                                fz={em(14)}
                                fw={500}
                              >
                                {tl("add")} {tl("product_supplies")}
                              </Button>
                            );
                          }}
                        />
                      </Group>
                    </Stack>
                  </Stack>
                </Renderer>

                <Renderer visible={type === ProductType.COMBO}>
                  <Stack>
                    <Divider
                      mb={-10}
                      label={`${tl("products")} / ${tl("services")}`}
                      labelPosition="left"
                      fw={700}
                    />

                    <Stack>
                      {combos.map((benefit, i) => (
                        <Card key={i} withBorder shadow="none" p={10}>
                          <Stack gap={5}>
                            <Group justify="space-between" wrap="nowrap" align="start">
                              <FormProductCombo
                                key={i}
                                combo={benefit}
                                onChange={(v) => combosHandler.setItem(i, v)}
                                onRemove={() => combosHandler.remove(i)}
                              />

                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                disabled={combos.length === 1}
                                onClick={() => combosHandler.remove(i)}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          </Stack>
                        </Card>
                      ))}

                      <Group>
                        <ProductSelector
                          excludeIds={combos.map((c) => c.productId)}
                          type={[ProductType.PRODUCT, ProductType.SERVICE]}
                          isStockCheck={true}
                          onSelect={(product) => {
                            if (combos.some((c) => c.productId === product._id)) return;
                            combosHandler.append({
                              product,
                              productId: product._id,
                              quantity: 1,
                            });
                          }}
                          target={(ctx) => {
                            return (
                              <Button
                                tt="capitalize"
                                size="xs"
                                variant="light"
                                radius={100}
                                leftIcon={IconPlus}
                                fz={em(14)}
                                fw={500}
                                onClick={ctx.toggle}
                              >
                                {tl("add")} {`${tl("products")} / ${tl("services")}`.toLowerCase()}
                              </Button>
                            );
                          }}
                        />
                      </Group>
                    </Stack>
                  </Stack>
                </Renderer>

                <Renderer visible={type === ProductType.VOUCHER}>
                  <Stack>
                    <Divider
                      mb={-10}
                      label={`${tl("voucher_config")}`}
                      labelPosition="left"
                      fw={700}
                    />

                    <NumberInput
                      label={tl("expireInDays")}
                      description={tl("expireInDays_desc")}
                      {...form.getInputProps("voucherExpireInDays")}
                    />

                    <Divider
                      mb={-10}
                      label={`${tl("include_products")}`}
                      labelPosition="left"
                      fw={700}
                    />

                    {voucherIncludeProducts.map((product, i) => (
                      <Card key={product._id} withBorder shadow="none" p={8}>
                        <Group justify="space-between">
                          <Text>{product.name}</Text>

                          <ActionIcon
                            variant="transparent"
                            color="gray"
                            onClick={() => voucherIncludeProductsHandler.remove(i)}
                          >
                            <IconX strokeWidth={1.3} size={18} />
                          </ActionIcon>
                        </Group>
                      </Card>
                    ))}

                    <Group>
                      <ProductSelector
                        type={[ProductType.SERVICE, ProductType.PRODUCT]}
                        excludeIds={voucherIncludeProducts.map((p) => p._id)}
                        onSelect={(product) => {
                          if (voucherIncludeProducts.some((p) => p._id === product._id)) return;
                          voucherIncludeProductsHandler.append(product);
                        }}
                      />
                    </Group>

                    <Divider
                      mb={-10}
                      label={`${tl("exclude_products")}`}
                      labelPosition="left"
                      fw={700}
                    />

                    {voucherExcludeProducts.map((product, i) => (
                      <Card key={product._id} withBorder shadow="none" p={8}>
                        <Group justify="space-between">
                          <Text>{product.name}</Text>

                          <ActionIcon
                            variant="transparent"
                            color="gray"
                            onClick={() => voucherExcludeProductsHandler.remove(i)}
                          >
                            <IconX strokeWidth={1.3} size={18} />
                          </ActionIcon>
                        </Group>
                      </Card>
                    ))}

                    <Group>
                      <ProductSelector
                        excludeIds={voucherIncludeProducts.map((p) => p._id)}
                        type={[ProductType.SERVICE, ProductType.PRODUCT]}
                        onSelect={(product) => {
                          if (combos.some((c) => c.productId === product._id)) return;
                          voucherExcludeProductsHandler.append(product);
                        }}
                      />
                    </Group>
                  </Stack>
                </Renderer>

                <BuilderCustomFields
                  before={
                    <Divider
                      mb={-10}
                      label={`${tl("custom_fields")}`}
                      labelPosition="left"
                      fw={700}
                    />
                  }
                  entity={AppEntity.PRODUCTS}
                  value={form.values.customFields}
                  onChange={(value) => form.setFieldValue("customFields", value)}
                />
              </Stack>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value={FormProductTab.POST} pt={16}>
            <Editor
              isAlwayShowToolbar
              placeholder={tl("enter_content")}
              value={form.values.content}
              onChangeHTML={(value) => form.setFieldValue("content", value)}
            />
          </Tabs.Panel>

          <Tabs.Panel value={FormProductTab.ANALYTICS} pt={16}>
            <LaunchingSoon shadow="none" />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {[FormProductTab.SETTING, FormProductTab.POST].includes(tab) && (
        <Stack mt={25} align="center" justify="center" gap={10}>
          <Button loading={isSubmitting} onClick={onSubmit} leftIcon={IconCheck} type="submit">
            {tl(product ? "update" : "create_new")}
          </Button>

          {product?._id && (
            <ButtonArchive
              process={() => archiveProduct(product!._id)}
              onArchived={() => props.onClose()}
              goBackWhenArchived={false}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};
