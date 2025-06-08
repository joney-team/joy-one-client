import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { ProductSelector } from "@/components/selector/product-selector";
import { t, tMulti } from "@/modules/lang/lang-service";
import { ProductStockEntity } from "@/modules/product-stocks/product-stocks-entity";
import { productStockOut, productStockRecordTypeOptions } from "@/modules/product-stocks/product-stocks-service";
import { ProductStockOutDto, ProductStockRecordType } from "@/modules/product-stocks/product-stocks-types";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { onError } from "@/utils/exceptions.utils";
import { Input, InputWrapper, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { FC, useRef } from "react";

interface ModalProductStockOutProps {
  stock?: ProductStockEntity;
}

export let OnModalProductStockOut: (props?: ModalProductStockOutProps) => any = () => {};

export const ModalProductStockOut: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const props = useRef<ModalProductStockOutProps | null>(null);

  const form = useForm<{
    product?: ProductEntity;
    quantity?: number;
    note?: string;
  }>({
    initialValues: {},
    validate: {},
  });

  OnModalProductStockOut = (_props) => {
    props.current = _props || null;
    form.setInitialValues({
      product: _props?.stock?.product,
    });
    form.reset();
    open();
  };

  const onClose = () => {
    form.reset();
    close();
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const dto: ProductStockOutDto = {
        productId: values.product?._id || "",
        quantity: values.quantity || 0,
        note: values.note || undefined,
        stockId: props.current?.stock?.id,
      };

      await productStockOut(dto);
      onClose();
    } catch (error) {
      onError(error);
    }
  });

  return (
    <Modal
      title={
        <ModalTitle
          title={`product_stock_record_type_${ProductStockRecordType.STOCK_OUT}`}
          icon={productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].icon}
          color={color(productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].color)}
        />
      }
      onClose={onClose}
      opened={opened}
    >
      <Stack gap={10}>
        <Stack>
          <ProductSelector
            type={ProductType.PRODUCT}
            isStockCheck
            excludeIds={form.values.product?._id ? [form.values.product?._id] : []}
            onSelect={(product) => form.setFieldValue("product", product)}
            renderTrigger={(ctx) => {
              return (
                <InputWrapper flex={1} label={t("product")}>
                  <Input
                    onClick={ctx.toggle}
                    flex={1}
                    value={form.values.product?.name || ""}
                    onChange={() => false}
                    placeholder={tMulti(["select"], ["product"])}
                    disabled={!!props.current?.stock}
                  />
                </InputWrapper>
              );
            }}
          />

          <NumberInput
            label={t("quantity")}
            {...form.getInputProps("quantity")}
            min={0}
            max={props.current?.stock ? props.current.stock.remainQuantity : undefined}
          />

          <Textarea label={t("note")} {...form.getInputProps("note")} />
        </Stack>

        <Stack align="center" mt={16}>
          <Button
            action
            rightIcon={productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].icon}
            color={color(productStockRecordTypeOptions[ProductStockRecordType.STOCK_OUT].color)}
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
