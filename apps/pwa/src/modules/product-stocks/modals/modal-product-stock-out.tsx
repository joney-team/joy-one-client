"use client";

import { Button } from "@/components/buttons/button";
import { Modal } from "@/components/modal/modal";
import { ProductStockRecordType, ProductType } from "@/graphql/enums.graphql";
import { ProductStockOutInput } from "@/graphql/types.graphql";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { ProductFragment } from "@/modules/products/graphql/fragmentProduct.graphql";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Input, InputWrapper, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { FC, Fragment, ReactNode, useRef } from "react";
import { ProductStockFragment } from "../graphql/fragmentProductStock.graphql";
import ProductStockOutDocument from "../graphql/productStockOut.graphql";
import { productStockRecordTypes } from "../product-stocks-constants";

interface ModalProductStockOutArgs {
  stock?: ProductStockFragment;
}

export const ModalProductStockOut: FC<{
  children: (open: (args?: ModalProductStockOutArgs) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const props = useRef<ModalProductStockOutArgs | null>(null);
  const { t } = useLingui();
  const client = useApolloClient();

  const form = useForm<{
    product?: Pick<ProductFragment, "_id" | "name">;
    quantity?: number;
    note?: string;
  }>({
    initialValues: {},
    validate: {},
  });

  const onClose = () => {
    form.reset();
    close();
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const input: ProductStockOutInput = {
        productId: values.product?._id || "",
        quantity: values.quantity || 0,
        note: values.note || undefined,
        stockId: props.current?.stock?.id,
      };

      await client.mutate({
        mutation: ProductStockOutDocument,
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
        props.current = args || null;
        form.setInitialValues({
          product: args?.stock?.product,
        });
        form.reset();
        open();
      })}

      <Modal
        name={<Trans>Stock out</Trans>}
        icon={productStockRecordTypes[ProductStockRecordType.StockOut].icon}
        color={color(productStockRecordTypes[ProductStockRecordType.StockOut].color)}
        onClose={onClose}
        opened={opened}
      >
        <Stack gap={10}>
          <Stack>
            <ProductSelector
              type={ProductType.Product}
              isStockCheck
              excludeIds={form.values.product?._id ? [form.values.product?._id] : []}
              onSelect={(product) => form.setFieldValue("product", product)}
              target={(ctx) => {
                return (
                  <InputWrapper flex={1} label={<Trans>Product</Trans>}>
                    <Input
                      onClick={ctx.toggle}
                      flex={1}
                      value={form.values.product?.name || ""}
                      onChange={() => false}
                      placeholder={t`Select product`}
                      disabled={!!props.current?.stock}
                    />
                  </InputWrapper>
                );
              }}
            />

            <NumberInput
              label={<Trans>Quantity</Trans>}
              {...form.getInputProps("quantity")}
              min={0}
              max={props.current?.stock ? props.current.stock.remainQuantity : undefined}
            />

            <Textarea label={<Trans>Note</Trans>} {...form.getInputProps("note")} />
          </Stack>

          <Stack align="center" mt={16}>
            <Button
              rightIcon={productStockRecordTypes[ProductStockRecordType.StockOut].icon}
              color={color(productStockRecordTypes[ProductStockRecordType.StockOut].color)}
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
