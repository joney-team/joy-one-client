"use client";

import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Editor } from "@/components/editor/editor";
import { ImageInput } from "@/components/inputs/image-input";
import { LaunchingSoon } from "@/components/launching-soon";
import { Renderer } from "@/components/renderer";
import { CategoryType, ProductType } from "@/graphql/enums.graphql";
import { ProductInput } from "@/graphql/types.graphql";
import { CategoryInput } from "@/modules/categories/components/category-input";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
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
import ArchiveProductDocument from "../graphql/archiveProduct.graphql";
import CreateProductDocument from "../graphql/createProduct.graphql";
import { ProductFragment } from "../graphql/fragmentProduct.graphql";
import UpdateProductDocument from "../graphql/updateProduct.graphql";
import { productTypes } from "../products-constants";
import { removeTypeName } from "@joy-one/utils/remove-type-name";

export type FormProductProps = {
  onDone?: (product: ProductFragment) => void | Promise<void>;
} & (
  | {
      type: ProductType;
    }
  | {
      product: ProductFragment;
    }
);

enum FormProductTab {
  SETTING = "SETTING",
  POST = "POST",
  ANALYTICS = "ANALYTICS",
}

type ProductCombo = ProductFragment["combos"][number];

const FormProductCombo: FC<{
  combo: ProductCombo;
  onChange: (combo: ProductCombo) => void;
  onRemove: () => void;
}> = (props) => {
  const { t } = useLingui();
  const { combo, onChange } = props;

  return (
    <Group wrap="nowrap" flex={1}>
      <ProductSelector
        type={[ProductType.Product, ProductType.Service]}
        onSelect={(product) => onChange({ ...combo, product, productId: product._id })}
        target={(ctx) => {
          return (
            <TextInput
              flex={1}
              label={t`Product`}
              value={combo.product?.name}
              readOnly
              onClick={ctx.toggle}
            />
          );
        }}
      />

      <NumberInput
        label={t`Quantity`}
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
  const client = useApolloClient();
  const { t } = useLingui();
  const [tab, setTab] = useState<FormProductTab>(FormProductTab.SETTING);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const product = "product" in props ? props.product : undefined;
  const type = ("type" in props ? props.type : product?.type) as ProductType;

  const [supplies, handlers] = useListState(product?.supplies || []);
  const [combos, combosHandler] = useListState(product?.combos || []);
  const [voucherIncludeProducts, voucherIncludeProductsHandler] = useListState(
    product?.voucherIncludeProducts || [],
  );
  const [voucherExcludeProducts, voucherExcludeProductsHandler] = useListState(
    product?.voucherExcludeProducts || [],
  );

  const form = useForm({
    initialValues: {
      type,
      name: product?.name || undefined,
      displayName: product?.displayName || undefined,
      unit:
        product?.unit ||
        (productTypes[type]?.defaultUnit ? t(productTypes[type].defaultUnit) : "") ||
        "",
      price: product?.price || undefined,
      minPrice: product?.minPrice || undefined,
      maxPrice: product?.maxPrice || undefined,
      code: product?.code || undefined,
      content: product?.content || undefined,
      isRangePrice: typeof product?.minPrice === "number",
      voucherAmount: product?.voucherAmount || undefined,
      image: product?.image || undefined,
      defaultQtyPerUse: product?.defaultQtyPerUse || undefined,
      category: product?.category || null,
      combosExpireInDays: product?.combosExpireInDays || undefined,
      isStockCheck: product?.isStockCheck || false,
      customFieldValues: product?.customFieldValues || [],
      isHiddenInReceiptWhenNoPrice: product?.isHiddenInReceiptWhenNoPrice || false,
      productCode: product?.productCode || undefined,
      tags: product?.tags || [],
      voucherExpireInDays: product?.voucherExpireInDays || undefined,
      warningOutOfDateBeforeDays: product?.warningOutOfDateBeforeDays || undefined,
      warningOutOfStockQty: product?.warningOutOfStockQty || undefined,
    },
    validate: {
      name: (value) => {
        if (!value) return t`Must be provided`;
      },
      unit: (value) => {
        if (!value) return t`Must be provided`;
      },
      price: (value: number | undefined, values: any) => {
        if (typeof value !== "number") return t`Must be provided`;
        if (value < 0) return t`Minimum amount is ${0}`;

        if (values.isRangePrice) {
          if (values.minPrice && values.minPrice > value)
            return t`Default price must be in the price range`;
          if (values.maxPrice && values.maxPrice < value)
            return t`Default price must be in the price range`;
        }
      },
      minPrice: (value, values) => {
        if (values.isRangePrice) {
          if (typeof value !== "number") return t`Must be provided`;
          if (values.maxPrice && values.maxPrice < value)
            return t`Minimum price must be less than maximum price`;
        }
      },
      maxPrice: (value, values) => {
        if (values.isRangePrice) {
          if (typeof value !== "number") return t`Must be provided`;
          if (values.minPrice && values.minPrice > value)
            return t`Maximum price must be greater than minimum price`;
        }
      },
      voucherAmount: (value) => {
        if (type === ProductType.Voucher) {
          if (typeof value !== "number") return t`Must be provided`;
          if (value < 0) return t`Minimum amount is ${0}`;
        }
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      // Validate
      if (type === ProductType.Combo) {
        if (combos.length === 0)
          throw new Error(`${t`Must be provided`} ${t`Products`}/${t`Services`}`);
      }

      const input: ProductInput = {
        name: values.name!,
        price: values.price!,
        unit: values.unit,
        code: values.code,
        image: values.image,
        displayName: values.displayName,
        defaultQtyPerUse: values.defaultQtyPerUse,
        type: values.type,
        categoryId: values.category?._id,
        supplies,
        combos: combos.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        combosExpireInDays: values.combosExpireInDays,
        content: values.content,
        isStockCheck: values.isStockCheck,
        customFieldValues: values.customFieldValues.map((customFielValue) => ({
          customFieldId: customFielValue.customFieldId,
          value: customFielValue.value,
        })),
        isHiddenInReceiptWhenNoPrice: values.isHiddenInReceiptWhenNoPrice,
        maxPrice: values.maxPrice,
        minPrice: values.minPrice,
        productCode: values.productCode,
        tags: values.tags,
        voucherAmount: values.voucherAmount,
        voucherExcludeProductIds: voucherExcludeProducts.map((p) => p._id),
        voucherIncludeProductIds: voucherIncludeProducts.map((p) => p._id),
        voucherExpireInDays: values.voucherExpireInDays,
        warningOutOfDateBeforeDays: values.warningOutOfDateBeforeDays,
        warningOutOfStockQty: values.warningOutOfStockQty,
      };

      if (!values.isRangePrice) delete input.minPrice;

      const action = product
        ? () =>
            client.mutate({
              mutation: UpdateProductDocument,
              variables: { productId: product._id, input },
            })
        : () =>
            client.mutate({
              mutation: CreateProductDocument,
              variables: { input },
            });

      const res = await action();
      if (res.data) {
        await props.onDone?.(res.data.product);
      }
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
                <Trans>Settings</Trans>
              </Group>
            </Tabs.Tab>
            <Tabs.Tab value={FormProductTab.POST} fw={500}>
              <Group align="center" gap={5}>
                <IconNews size={16} strokeWidth={1.5} />
                <Trans>Post</Trans>
              </Group>
            </Tabs.Tab>
            <Tabs.Tab value={FormProductTab.ANALYTICS} fw={500} disabled={!product?._id}>
              <Group align="center" gap={5}>
                <IconChartBar size={16} strokeWidth={1.5} />
                <Trans>Analytics</Trans>
              </Group>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={FormProductTab.SETTING} pt={16}>
            <SimpleGrid cols={{ md: 2 }} spacing={30}>
              <Stack>
                <ImageInput {...form.getInputProps("image")} w={150} h={150} />

                <TextInput
                  withAsterisk
                  label={<Trans>Name</Trans>}
                  {...form.getInputProps("name")}
                />
                <TextInput
                  withAsterisk
                  label={<Trans>Unit</Trans>}
                  {...form.getInputProps("unit")}
                />

                <TextInput label={<Trans>Code</Trans>} {...form.getInputProps("code")} />

                <Renderer visible={type === ProductType.Product}>
                  <NumberInput
                    label={<Trans>Min per use</Trans>}
                    description={<Trans>Default is ${1}</Trans>}
                    {...form.getInputProps("defaultQtyPerUse")}
                    hideControls
                  />
                </Renderer>

                <Switch
                  label={<Trans>Range price</Trans>}
                  checked={form.values.isRangePrice}
                  onChange={(e) => form.setFieldValue("isRangePrice", e.target.checked)}
                />

                <Renderer visible={form.values.isRangePrice}>
                  <Group wrap="nowrap" align="start">
                    <NumberInput
                      withAsterisk
                      label={<Trans>Min price</Trans>}
                      flex={1}
                      hideControls
                      {...form.getInputProps("minPrice")}
                    />
                    <NumberInput
                      withAsterisk
                      label={<Trans>Max price</Trans>}
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
                  label={<Trans>Default price</Trans>}
                  withAsterisk
                  hideControls
                  {...form.getInputProps("price")}
                />

                <Renderer visible={type === ProductType.Voucher}>
                  <NumberInput
                    withAsterisk
                    label={<Trans>Voucher amount</Trans>}
                    hideControls
                    {...form.getInputProps("voucherAmount")}
                  />
                </Renderer>

                <CategoryInput
                  label={<Trans>Categories</Trans>}
                  {...form.getInputProps("category")}
                  type={CategoryType.Products}
                />
              </Stack>

              <Stack>
                <Stack>
                  <Divider mb={-10} label={<Trans>Settings</Trans>} labelPosition="left" fw={700} />

                  <TextInput
                    label={<Trans>Display name</Trans>}
                    description={
                      <Trans>
                        Another name displayed on the ticket, invoice sent to customers. Not
                        required
                      </Trans>
                    }
                    {...form.getInputProps("displayName")}
                  />

                  <Switch
                    label={<Trans>Hidden in receipt when no price</Trans>}
                    checked={form.values.isHiddenInReceiptWhenNoPrice}
                    styles={{ label: { fontSize: 14 } }}
                    {...form.getInputProps("isHiddenInReceiptWhenNoPrice")}
                  />

                  <Renderer visible={type === ProductType.Product}>
                    <Switch
                      label={<Trans>Stock check</Trans>}
                      checked={form.values.isStockCheck}
                      styles={{ label: { fontSize: 14 } }}
                      {...form.getInputProps("isStockCheck")}
                    />

                    <Renderer visible={form.values.isStockCheck}>
                      <NumberInput
                        label={<Trans>Warning out of date</Trans>}
                        description={
                          <Trans>
                            Ex: Enter 7 - Warn 7 days before expiration, leave blank or fill in 0 to
                            turn off the warning
                          </Trans>
                        }
                        hideControls
                        {...form.getInputProps("warningOutOfDateBeforeDays")}
                      />

                      <NumberInput
                        label={<Trans>Warning out of stock</Trans>}
                        description={
                          <Trans>
                            Ex: Enter 10 - Warn when stock is below 10, leave blank or fill in 0 to
                            turn off the warning
                          </Trans>
                        }
                        {...form.getInputProps("warningOutOfStockQty")}
                        hideControls
                      />
                    </Renderer>
                  </Renderer>
                </Stack>

                <Renderer
                  visible={([ProductType.Product, ProductType.Service] as ProductType[]).includes(
                    type,
                  )}
                >
                  <Stack>
                    <Divider
                      mb={-10}
                      label={<Trans>Product supplies</Trans>}
                      labelPosition="left"
                      fw={700}
                    />

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
                                  placeholder={t`Amount`}
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
                          type={[ProductType.Product]}
                          excludeIds={[...supplies.map((s) => s.productId), product?._id || ""]}
                          onSelect={(product) => {
                            handlers.append({
                              __typename: "ProductSupplyResult",
                              productId: product._id,
                              product: {
                                __typename: "Product",
                                _id: product._id,
                                name: product.name,
                                unit: product.unit,
                              },
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
                              >
                                <Trans>Add product supplies</Trans>
                              </Button>
                            );
                          }}
                        />
                      </Group>
                    </Stack>
                  </Stack>
                </Renderer>

                <Renderer visible={type === ProductType.Combo}>
                  <Stack>
                    <Divider
                      mb={-10}
                      label={<Trans>Products/Services</Trans>}
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
                          type={[ProductType.Product, ProductType.Service]}
                          isStockCheck={true}
                          onSelect={(product) => {
                            if (combos.some((c) => c.productId === product._id)) return;
                            combosHandler.append({
                              __typename: "ProductComboResult",
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
                                onClick={ctx.toggle}
                              >
                                <Trans>Add Products/Services</Trans>
                              </Button>
                            );
                          }}
                        />
                      </Group>
                    </Stack>
                  </Stack>
                </Renderer>

                <Renderer visible={type === ProductType.Voucher}>
                  <Stack>
                    <Divider
                      mb={-10}
                      label={<Trans>Voucher config</Trans>}
                      labelPosition="left"
                      fw={700}
                    />

                    <NumberInput
                      label={<Trans>Expire in days</Trans>}
                      description={
                        <Trans>
                          Enter the expiration date, leave blank or fill in 0 if not applicable
                        </Trans>
                      }
                      {...form.getInputProps("voucherExpireInDays")}
                    />

                    <Divider
                      mb={-10}
                      label={<Trans>Include products / services</Trans>}
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
                        type={[ProductType.Service, ProductType.Product]}
                        excludeIds={voucherIncludeProducts.map((p) => p._id)}
                        onSelect={(product) => {
                          if (voucherIncludeProducts.some((p) => p._id === product._id)) return;
                          voucherIncludeProductsHandler.append(product);
                        }}
                      />
                    </Group>

                    <Divider
                      mb={-10}
                      label={<Trans>Exclude products</Trans>}
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
                        type={[ProductType.Service, ProductType.Product]}
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
                      label={<Trans>Custom fields</Trans>}
                      labelPosition="left"
                      fw={700}
                    />
                  }
                  entity={AppEntity.PRODUCTS}
                  value={form.values.customFieldValues}
                  onChange={(value) => form.setFieldValue("customFieldValues", value)}
                />
              </Stack>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value={FormProductTab.POST} pt={16}>
            <Editor
              isEnableToolbar
              placeholder={t`Enter content`}
              defaultValue={form.values.content}
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
          <Button
            loading={isSubmitting}
            onClick={() => onSubmit()}
            leftIcon={IconCheck}
            type="submit"
          >
            {product ? <Trans>Update</Trans> : <Trans>Create new</Trans>}
          </Button>

          {product?._id && (
            <ButtonArchive
              process={() =>
                client.mutate({
                  mutation: ArchiveProductDocument,
                  variables: { productId: product._id },
                })
              }
              onArchived={() => props.onClose()}
              goBackWhenArchived={false}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};
