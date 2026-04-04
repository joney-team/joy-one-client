"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { DateInput } from "@/components/inputs/date-input";
import { ModalHead } from "@/components/modal/modal-head";
import { ProductStockRecordType, ProductType } from "@/graphql/enums.graphql";
import { BulkProductsStockInInput } from "@/graphql/types.graphql";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { ProductFragment } from "@/modules/products/graphql/fragmentProduct.graphql";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { required } from "@/utils/form.validate";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { FC, Fragment, ReactNode, useRef } from "react";
import BulkProductsStockInDocument from "../graphql/bulkProductsStockIn.graphql";
import { productStockRecordTypes } from "../product-stocks-constants";
interface ProductStockInModalProps {
  product?: ProductFragment;
}

export interface ProductStockInRecordItem {
  product?: ProductFragment;
  quantity?: number;
  costPrice?: number;
  expireAt?: number;
  note?: string;
  code?: string;
}

export const ModalProductStockIn: FC<{
  children: (open: (args?: ProductStockInModalProps) => void) => ReactNode;
}> = ({ children }) => {
  const { t } = useLingui();
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const _product = useRef<ProductFragment | null>(null);
  const isBulk = !!!_product.current;
  const client = useApolloClient();

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
          if (!value || value <= 0) return t`Invalid quantity`;
        },
      },
    },
  });

  const onAddItem = () => {
    form.setFieldValue("items", [...form.values.items, {}]);
  };

  const onClose = () => {
    form.reset();
    close();
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const input: BulkProductsStockInInput = {
        stocks: values.items.map((item) => ({
          productId: item.product?._id || "",
          quantity: item.quantity || 0,
          costPrice: item.costPrice || 0,
          code: item.code,
          expireAt: item.expireAt || undefined,
          note: item.note || undefined,
        })),
      };
      await client.mutate({
        mutation: BulkProductsStockInDocument,
        variables: { input },
      });

      onClose();
    } catch (error) {
      onError(error);
    }
  });

  return (
    <Fragment>
      {children((args) => {
        _product.current = args?.product || null;
        form.setInitialValues({
          items: [
            {
              product: args?.product,
            },
          ],
        });
        form.reset();
        open();
      })}

      <Modal
        title={<ModalHead name={<Trans>Stock in</Trans>} icon={IconBuildingWarehouse} />}
        onClose={onClose}
        opened={opened}
        size={1000}
      >
        <Stack gap={10}>
          <InputWrapper label={<Trans>List</Trans>}>
            <Table withTableBorder withColumnBorders withRowBorders horizontalSpacing={8}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th fz={12} fw={500}>
                    #
                  </Table.Th>
                  <Table.Th fz={12} fw={500}>
                    <Trans>Product</Trans>
                  </Table.Th>
                  <Table.Th fz={12} fw={500}>
                    <Trans>Product stock code</Trans>
                  </Table.Th>
                  <Table.Th fz={12} fw={500}>
                    <Trans>Expire at</Trans>
                  </Table.Th>
                  <Table.Th fz={12} fw={500}>
                    <Trans>Note</Trans>
                  </Table.Th>
                  <Table.Th fz={12} fw={500}>
                    <Trans>Quantity</Trans>
                  </Table.Th>
                  <Table.Th fz={12} fw={500} ta="right">
                    <Trans>Cost price</Trans>
                  </Table.Th>
                  <Table.Th fz={12} fw={500}>
                    {isBulk && (
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
                          type={ProductType.Product}
                          excludeIds={form.values.items.map((v) => v.product?._id || "")}
                          onSelect={(product) => onChange({ ...item, product })}
                          target={(ctx) => {
                            return (
                              <InputWrapper flex={1} {...form.getInputProps(`items.${i}.product`)}>
                                <Group
                                  className={isBulk ? "clickable" : "unselectable"}
                                  justify="space-between"
                                  onClick={isBulk ? ctx.toggle : undefined}
                                  flex={1}
                                >
                                  <Text
                                    c={item.product ? "dark" : "gray.6"}
                                    fw={item.product ? undefined : 300}
                                    fz={item.product ? undefined : 14}
                                  >
                                    {item.product?.name || t`Select product`}
                                  </Text>

                                  {isBulk && (
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
                              form.values.items.filter((_, j) => j !== i),
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
                    <Trans>Total</Trans>
                  </Table.Td>

                  <Table.Td ta="right">
                    <NumberFormat
                      value={form.values.items.reduce((acc, item) => acc + (item.quantity || 0), 0)}
                    />
                  </Table.Td>

                  <Table.Td ta="right">
                    <CurrencyFormat
                      value={form.values.items.reduce(
                        (acc, item) => acc + (item.quantity || 0) * (item.costPrice || 0),
                        0,
                      )}
                    />
                  </Table.Td>

                  <Table.Td>
                    {isBulk && (
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
              leftIcon={productStockRecordTypes[ProductStockRecordType.StockIn].icon}
              color={color(productStockRecordTypes[ProductStockRecordType.StockIn].color)}
              loading={form.submitting}
              onClick={() => onSubmit()}
            >
              <Trans>Complete</Trans>
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Fragment>
  );
};
