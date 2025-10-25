"use client";

import { num, renderDate } from "@/modules/lang/lang-service";
import { ProductVoucherEntity } from "@/modules/product-vouchers/product-vouchers-types";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductType } from "@/modules/products/products-types";
import { t } from "@lingui/core/macro";
import {
  Badge,
  Card,
  CardProps,
  em,
  Group,
  PolymorphicComponentProps,
  Stack,
  Text,
} from "@mantine/core";
import { FC } from "react";
import { EntityImage } from "../../components/entity-image";
import { Renderer } from "../../components/renderer";
import { productVoucherStatuses } from "./product-vouchers-constants";

interface ProductVoucherCardProps extends PolymorphicComponentProps<"div", CardProps> {
  voucher: ProductVoucherEntity;
  hideCustomer?: boolean;
}

export const ProductVoucherCard: FC<ProductVoucherCardProps> = (props) => {
  const { voucher } = props;

  return (
    <Card withBorder shadow="none" p={8} {...props}>
      <Group align="start" gap={10}>
        <EntityImage
          size={44}
          src={voucher.productVoucher.image}
          icon={getProductIcon(ProductType.VOUCHER)}
        />

        <Stack gap={3} flex={1}>
          <Text fw={500}>{voucher.productVoucher.name}</Text>

          <Badge
            color={productVoucherStatuses[voucher.status].color}
            size="xs"
            variant="light"
            mb={5}
          >
            {productVoucherStatuses[voucher.status].label()}
          </Badge>

          <Text fw={500} fz={em(13)} c="gray">
            • {t`Voucher amount`}: {num(voucher.remainAmount, { type: "money" })}/
            {num(voucher.amount, { type: "money" })}
          </Text>

          <Renderer visible={!!voucher.productVoucher.voucherExpireInDays}>
            <Text fw={500} fz={em(13)} c="gray">
              •{" "}
              {`${t`Expire date`}: ${renderDate(
                voucher.createdAt + voucher.productVoucher.voucherExpireInDays! * 60 * 60 * 24
              )}`}
            </Text>
          </Renderer>

          <Renderer visible={!!!props.hideCustomer}>
            <Text fw={500} fz={em(13)} c="gray">
              • {`${t`Customer`}: ${voucher.customer.name}`}
            </Text>
          </Renderer>

          <Renderer
            visible={
              !!voucher.productVoucher.voucherIncludeProducts &&
              voucher.productVoucher.voucherIncludeProducts.length > 0
            }
          >
            <Text fw={500} fz={em(13)} c="gray">
              • {`${t`Include products`}:`}
            </Text>
            {voucher.productVoucher.voucherIncludeProducts?.map((product) => {
              return (
                <Text key={product._id} fw={500} fz={em(13)} c="gray" pl={10}>
                  - {product.name}
                </Text>
              );
            })}
          </Renderer>

          <Renderer
            visible={
              !!voucher.productVoucher.voucherExcludeProducts &&
              voucher.productVoucher.voucherExcludeProducts.length > 0
            }
          >
            <Text fw={500} fz={em(13)} c="gray">
              • {`${t`Exclude products`}:`}
            </Text>
            {voucher.productVoucher.voucherExcludeProducts?.map((product) => {
              return (
                <Text key={product._id} fw={500} fz={em(13)} c="gray" pl={10}>
                  - {product.name}
                </Text>
              );
            })}
          </Renderer>

          <Renderer
            visible={
              (!voucher.productVoucher.voucherExcludeProducts ||
                voucher.productVoucher.voucherExcludeProducts.length === 0) &&
              (!voucher.productVoucher.voucherIncludeProducts ||
                voucher.productVoucher.voucherIncludeProducts.length === 0)
            }
          >
            <Text fw={500} fz={em(13)} c="gray">
              • {`${t`Apply all products`}`}
            </Text>
          </Renderer>
        </Stack>
      </Group>
    </Card>
  );
};
