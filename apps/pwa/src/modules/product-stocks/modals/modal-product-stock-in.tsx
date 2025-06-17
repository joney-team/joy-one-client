"use client";

import { Button } from "@/components/buttons/button";
import { DateInput } from "@/components/inputs/date-input";
import { ModalTitle } from "@/components/modal-title";
import { NumberCurrencyFormatter } from "@/components/number-currency-formatter";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { num, t, tMulti } from "@/modules/lang/lang-service";
import {
  multipleProductsStockIn,
  productStockRecordTypeOptions,
} from "@/modules/product-stocks/product-stocks-service";
import {
  MultipleProductsStockInDto,
  ProductStockRecordType,
} from "@/modules/product-stocks/product-stocks-types";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { required } from "@/utils/form.validate";
import {
  ActionIcon,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconBuildingWarehouse, IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";
import { FC, useRef } from "react";

interface ProductStockInModalProps {
  product?: ProductEntity;
}

export let OnModalProductStockIn: (props?: ProductStockInModalProps) => any = () => {};

export interface ProductStockInRecordItem {
  product?: ProductEntity;
  quantity?: number;
  costPrice?: number;
  expireAt?: number;
  note?: string;
  code?: string;
}

export const ModalProductStockIn: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const _product = useRef<ProductEntity | null>(null);
  const isMultiple = !!!_product.current;

  const form = useForm<{
    items: ProductStockInRecordItem[];
  }>({
    initialValues: {
      items: [{}],
    },
    validate: {
      items: {
        product: required,
        quantity: (value) => {
          if (!value || value <= 0) return t("invalid_quantity");
        },
      },
    },
  });

  OnModalProductStockIn = (props) => {
    _product.current = props?.product || null;
    form.setInitialValues({
      items: [
        {
          product: props?.product,
        },
      ],
    });
    form.reset();
    open();
  };

  const onAddItem = () => {
    form.setFieldValue("items", [...form.values.items, {}]);
  };

  const onClose = () => {
    form.reset();
    close();
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const dto: MultipleProductsStockInDto = {
        stocks: values.items.map((item) => ({
          productId: item.product?._id || "",
          quantity: item.quantity || 0,
          costPrice: item.costPrice || 0,
          code: item.code,
          expireAt: item.expireAt || undefined,
          note: item.note || undefined,
        })),
      };
      await multipleProductsStockIn(dto);

      onClose();
    } catch (error) {
      onError(error);
    }
  });

  return (
    <Modal
      title={
        <ModalTitle
          title={`product_stock_record_type_${ProductStockRecordType.STOCK_IN}`}
          icon={IconBuildingWarehouse}
        />
      }
      onClose={onClose}
      opened={opened}
      size={1000}
    >
      <Stack gap={10}>
        <InputWrapper label={tMulti(["list"])}>
          <Table withTableBorder withColumnBorders withRowBorders horizontalSpacing={8}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th fz={12} fw={500}>
                  #
                </Table.Th>
                <Table.Th fz={12} fw={500}>
                  {t("product")}
                </Table.Th>
                <Table.Th fz={12} fw={500}>
                  {t("product_stock_code")}
                </Table.Th>
                <Table.Th fz={12} fw={500}>
                  {t("expire_at")}
                </Table.Th>
                <Table.Th fz={12} fw={500}>
                  {t("note")}
                </Table.Th>
                <Table.Th fz={12} fw={500}>
                  {t("quantity")}
                </Table.Th>
                <Table.Th fz={12} fw={500} ta="right">
                  {t("costPrice")}
                </Table.Th>
                <Table.Th fz={12} fw={500}>
                  {isMultiple && (
                    <ActionIcon variant="subtle" color="gray.6" onClick={onAddItem}>
                      <IconPlus size={16} />
                    </ActionIcon>
                  )}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {form.values.items.map((item, i) => {
                const onChange = (_item: ProductStockInRecordItem) => {
                  form.setFieldValue(`items.${i}`, _item);
                  form.setFieldError(`items.${i}.product`, undefined);
                };

                return (
                  <Table.Tr key={i}>
                    <Table.Td>{i + 1}</Table.Td>
                    <Table.Td miw={200}>
                      <ProductSelector
                        type={ProductType.PRODUCT}
                        excludeIds={form.values.items.map((v) => v.product?._id || "")}
                        onSelect={(product) => onChange({ ...item, product })}
                        target={(ctx) => {
                          return (
                            <InputWrapper flex={1} {...form.getInputProps(`items.${i}.product`)}>
                              <Group
                                className={isMultiple ? "clickable" : "unselectable"}
                                justify="space-between"
                                onClick={isMultiple ? ctx.toggle : undefined}
                                flex={1}
                              >
                                <Text
                                  c={item.product ? "dark" : "gray.6"}
                                  fw={item.product ? undefined : 300}
                                  fz={item.product ? undefined : 14}
                                >
                                  {item.product?.name || tMulti(["select"], ["product"])}
                                </Text>

                                {isMultiple && (
                                  <ActionIcon variant="subtle" color="gray.6" size="sm">
                                    <IconChevronDown size={16} />
                                  </ActionIcon>
                                )}
                              </Group>
                            </InputWrapper>
                          );
                        }}
                      />
                    </Table.Td>

                    <Table.Td miw={100}>
                      <TextInput
                        value={item.code || ""}
                        {...form.getInputProps(`items.${i}.code`)}
                      />
                    </Table.Td>

                    <Table.Td miw={100}>
                      <DateInput {...form.getInputProps(`items.${i}.expireAt`)} />
                    </Table.Td>

                    <Table.Td miw={100}>
                      <TextInput
                        value={item.note || ""}
                        {...form.getInputProps(`items.${i}.note`)}
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberInput {...form.getInputProps(`items.${i}.quantity`)} />
                    </Table.Td>

                    <Table.Td miw={120}>
                      <NumberInput
                        {...form.getInputProps(`items.${i}.costPrice`)}
                        hideControls
                        styles={{
                          input: {
                            textAlign: "right",
                          },
                        }}
                      />
                    </Table.Td>

                    <Table.Td>
                      <ActionIcon
                        opacity={i === 0 ? 0 : 1}
                        disabled={i === 0}
                        variant="subtle"
                        color="gray.5"
                        onClick={() =>
                          form.setFieldValue(
                            `items`,
                            form.values.items.filter((_, j) => j !== i)
                          )
                        }
                      >
                        <IconTrash strokeWidth={1.5} size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}

              <Table.Tr>
                <Table.Td colSpan={5} ta="right">
                  {t("total")}
                </Table.Td>

                <Table.Td ta="right">
                  {num(form.values.items.reduce((acc, item) => acc + (item.quantity || 0), 0))}
                </Table.Td>

                <Table.Td ta="right">
                  <NumberCurrencyFormatter
                    value={form.values.items.reduce(
                      (acc, item) => acc + (item.quantity || 0) * (item.costPrice || 0),
                      0
                    )}
                  />
                </Table.Td>

                <Table.Td>
                  {isMultiple && (
                    <ActionIcon variant="subtle" color="gray.6" onClick={onAddItem}>
                      <IconPlus size={16} />
                    </ActionIcon>
                  )}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </InputWrapper>

        <Stack align="center" mt={16}>
          <Button
            action
            leftIcon={productStockRecordTypeOptions[ProductStockRecordType.STOCK_IN].icon}
            color={color(productStockRecordTypeOptions[ProductStockRecordType.STOCK_IN].color)}
            loading={form.submitting}
            onClick={onSubmit}
          >
            {t("complete")}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
