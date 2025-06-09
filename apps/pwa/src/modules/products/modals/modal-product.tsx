import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { EntityImage } from "@/components/entity-image";
import { TextInput } from "@/components/inputs/text-input";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { ProductSelector } from "@/components/selector/product-selector";
import { uploadFile } from "@/modules/files/file-service";
import { t } from "@/modules/lang/lang-service";
import { ProductCategoryInput } from "@/modules/product-categories/product-category-input";
import { archiveProduct, createProduct, updateProduct } from "@/modules/products/products-service";
import { ProductCombo, ProductEntity, ProductSupply, ProductType } from "@/modules/products/products-types";
import { onError } from "@/utils/exceptions.utils";
import {
  ActionIcon,
  Card,
  Divider,
  em,
  Group,
  NumberInput,
  SimpleGrid,
  Space,
  Stack,
  Switch,
  Tabs,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCheck, IconEdit, IconMinus, IconPlus, IconX } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ProductFormProps {
  product?: ProductEntity;
  type?: ProductType;
  onDone?: (product: ProductEntity) => void | Promise<void>;
}

const defaultUnitPerType: { [key in ProductType]?: string } = {
  [ProductType.COMBO]: "package",
  [ProductType.VOUCHER]: "voucher",
};

const ProductForm: FC<
  Omit<ProductFormProps, "type"> & {
    type: ProductType;
    onClose: () => void;
  }
> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supplies, handlers] = useListState<ProductSupply>(props.product?.supplies || []);
  const [combos, combosHandler] = useListState(props?.product?.combos || []);
  const [voucherIncludeProducts, voucherIncludeProductsHandler] = useListState(
    props?.product?.voucherIncludeProducts || []
  );
  const [voucherExcludeProducts, voucherExcludeProductsHandler] = useListState(
    props?.product?.voucherExcludeProducts || []
  );

  const form = useForm({
    initialValues: {
      ...props.product,
      type: props.type,
      unit: props.product?.unit || t(defaultUnitPerType[props.type] || "") || "",
      isRangePrice: typeof props.product?.minPrice === "number",
    } as any,
    validate: {
      name: (value: string) => {
        if (!value) return t("must_be_provided");
      },
      unit: (value: string) => {
        if (!value) return t("must_be_provided");
      },
      price: (value: number, values: any) => {
        if (typeof value !== "number") return t("must_be_provided");
        if (value < 0) return t("validate_min_amount", { min: 0 });

        if (values.isRangePrice) {
          if (values.minPrice && values.minPrice > value) return t("validate_range_price_with_default_price");
          if (values.maxPrice && values.maxPrice < value) return t("validate_range_price_with_default_price");
        }
      },
      minPrice: (value: number, values: any) => {
        if (values.isRangePrice) {
          if (typeof value !== "number") return t("must_be_provided");
          if (values.maxPrice && values.maxPrice < value) return t("validate_min_price_with_max_price");
        }
      },
      maxPrice: (value: number, values: any) => {
        if (values.isRangePrice) {
          if (typeof value !== "number") return t("must_be_provided");
          if (values.minPrice && values.minPrice > value) return t("validate_max_price_with_min_price");
        }
      },
      voucherAmount: (value: number) => {
        if (props.type === ProductType.VOUCHER) {
          if (typeof value !== "number") return t("must_be_provided");
          if (value < 0) return t("validate_min_amount", { min: 0 });
        }
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      // Validate
      if (props.type === ProductType.COMBO) {
        if (combos.length === 0) throw new Error(`${t("must_be_provided")} ${t("products")}/${t("services")}`);
      }

      let payload = {
        ...values,
        supplies,
        combos: combos.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        voucherExcludeProductIds: voucherExcludeProducts.map((p) => p._id),
        voucherIncludeProductIds: voucherIncludeProducts.map((p) => p._id),
      };

      if (!values.isRangePrice) delete payload.minPrice;

      if (values.image instanceof File) {
        const image = await uploadFile({ file: values.image, maxWidthOrHeight: 300 });
        payload.image = image.relativePath;
      }

      const action = props.product ? () => updateProduct(props.product!._id, payload) : () => createProduct(payload);

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
      <SimpleGrid cols={{ md: 2 }} spacing={30}>
        <Stack>
          <EntityImage src={form.values.image} onChange={(f) => form.setFieldValue("image", f)} />

          <TextInput withAsterisk label={t("name")} {...form.getInputProps("name")} />

          <TextInput withAsterisk label={t("unit")} {...form.getInputProps("unit")} />

          <Renderer visible={props.type === ProductType.PRODUCT}>
            <NumberInput
              label={t("min_per_use")}
              description={t("default_is", { value: 1 })}
              {...form.getInputProps("defaultQtyPerUse")}
              hideControls
            />
          </Renderer>

          <Switch
            label={t("range_price")}
            checked={form.values.isRangePrice}
            onChange={(e) => form.setFieldValue("isRangePrice", e.target.checked)}
          />

          <Renderer visible={form.values.isRangePrice}>
            <Group wrap="nowrap" align="start">
              <NumberInput
                withAsterisk
                label={t("min_price")}
                flex={1}
                hideControls
                {...form.getInputProps("minPrice")}
              />
              <NumberInput
                withAsterisk
                label={t("max_price")}
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

          <NumberInput label={t("default_price")} withAsterisk hideControls {...form.getInputProps("price")} />

          <Renderer visible={props.type === ProductType.VOUCHER}>
            <NumberInput
              withAsterisk
              label={t("voucherAmount")}
              hideControls
              {...form.getInputProps("voucherAmount")}
            />
          </Renderer>

          <ProductCategoryInput label={t("categories")} type={props.type} {...form.getInputProps("categoryId")} />
        </Stack>

        <Stack>
          <Stack>
            <Divider mb={-10} label={t("settings")} labelPosition="left" fw={700} />

            <TextInput
              label={t("display_name")}
              description={t("product_display_name_desc")}
              {...form.getInputProps("displayName")}
            />

            <Switch
              label={t("product_hide_ticket")}
              checked={form.values.isHiddenInReceiptWhenNoPrice}
              styles={{ label: { fontSize: 14 } }}
              {...form.getInputProps("isHiddenInReceiptWhenNoPrice")}
            />

            <Renderer visible={props.type === ProductType.PRODUCT}>
              <Switch
                label={t("product_stock_check")}
                checked={form.values.isStockCheck}
                styles={{ label: { fontSize: 14 } }}
                {...form.getInputProps("isStockCheck")}
              />

              <Renderer visible={form.values.isStockCheck}>
                <NumberInput
                  label={t("label_warning_out_of_date")}
                  description={t("label_warning_out_of_date_desc")}
                  hideControls
                  {...form.getInputProps("warningOutOfDateBeforeDays")}
                />

                <NumberInput
                  label={t("label_warning_out_of_stock")}
                  description={t("label_warning_out_of_stock_desc")}
                  {...form.getInputProps("warningOutOfStockQty")}
                  hideControls
                />
              </Renderer>
            </Renderer>
          </Stack>

          <Renderer visible={[ProductType.PRODUCT, ProductType.SERVICE].includes(props.type)}>
            <Stack>
              <Divider mb={-10} label={t("product_supplies")} labelPosition="left" fw={700} />
              <Text fz={em(10)} c="gray">
                {t("enter_product_supplies")}
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
                            placeholder={t("amount")}
                            min={0}
                            value={supply.quantity}
                            onChange={(e) => handlers.setItem(index, { ...supply, quantity: +e })}
                          />

                          <ActionIcon color="gray" variant="transparent" onClick={() => handlers.remove(index)}>
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
                    excludeIds={[...supplies.map((s) => s.productId), props.product?._id || ""]}
                    onSelect={(product) => {
                      handlers.append({
                        productId: product._id,
                        product,
                        quantity: product.defaultQtyPerUse || 1,
                      });
                    }}
                    renderTrigger={(ctx) => {
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
                          {t("add")} {t("product_supplies")}
                        </Button>
                      );
                    }}
                  />
                </Group>
              </Stack>
            </Stack>
          </Renderer>

          <Renderer visible={props.type === ProductType.COMBO}>
            <Stack>
              <Divider mb={-10} label={`${t("products")} / ${t("services")}`} labelPosition="left" fw={700} />

              <Stack>
                {combos.map((benefit, i) => (
                  <Card key={i} withBorder shadow="none" p={10}>
                    <Stack gap={5}>
                      <Group justify="space-between" wrap="nowrap" align="start">
                        <ComboForm
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
                      combosHandler.append({ product, productId: product._id, quantity: 1 });
                    }}
                    renderTrigger={(ctx) => {
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
                          {t("add")} {`${t("products")} / ${t("services")}`.toLowerCase()}
                        </Button>
                      );
                    }}
                  />
                </Group>
              </Stack>
            </Stack>
          </Renderer>

          <Renderer visible={props.type === ProductType.VOUCHER}>
            <Stack>
              <Divider mb={-10} label={`${t("voucher_config")}`} labelPosition="left" fw={700} />

              <NumberInput
                label={t("expireInDays")}
                description={t("expireInDays_desc")}
                {...form.getInputProps("voucherExpireInDays")}
              />

              <Divider mb={-10} label={`${t("include_products")}`} labelPosition="left" fw={700} />

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

              <Divider mb={-10} label={`${t("exclude_products")}`} labelPosition="left" fw={700} />

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
        </Stack>
      </SimpleGrid>

      <Stack mt={25} align="center" justify="center" gap={10}>
        <Button loading={isSubmitting} onClick={onSubmit} leftIcon={IconCheck} type="submit">
          {t("complete")}
        </Button>

        {props.product?._id && (
          <ButtonArchive
            process={() => archiveProduct(props.product!._id)}
            onArchived={() => props.onClose()}
            goBackWhenArchived={false}
          />
        )}
      </Stack>
    </Stack>
  );
};

const ModalContent = (props: ProductFormProps) => {
  const [typeActive, setTypeActive] = useState(props.type || Object.values(ProductType)[0]);
  const isAbleToSelectType = !props.product && !props.type;

  return (
    <Tabs value={typeActive} onChange={(t) => setTypeActive(t as ProductType)}>
      {isAbleToSelectType && (
        <>
          <Tabs.List>
            {Object.values(ProductType).map((type) => (
              <Tabs.Tab value={type} key={type + "tab"}>
                {t(`product_type_${type}`)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </>
      )}

      {Object.values(ProductType).map((type) => (
        <Tabs.Panel value={type} key={type + "panel"}>
          {isAbleToSelectType && <Space h={16} />}
          <ProductForm {...props} type={type} onClose={() => modals.close("ModalProductForm")} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export const OnProductModal = (props: ProductFormProps) => {
  let title = `${t(props.product ? "update" : "create_new")}`;
  if (props.type || props.product) title += ` ${t(`product_type_${props.type || props.product?.type}`)}`;

  return modals.open({
    modalId: "ModalProductForm",
    size: "xl",
    title: <ModalTitle title={title} icon={props.product ? IconEdit : IconPlus} />,
    children: <ModalContent {...props} />,
  });
};

const ComboForm: FC<{
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
        renderTrigger={(ctx) => {
          return <TextInput flex={1} label={t("product")} value={combo.product?.name} readOnly onClick={ctx.toggle} />;
        }}
      />

      <NumberInput
        label={t("quantity")}
        value={combo.quantity}
        min={1}
        maw={100}
        onChange={(v) => onChange({ ...combo, quantity: +v })}
      />
    </Group>
  );
};
