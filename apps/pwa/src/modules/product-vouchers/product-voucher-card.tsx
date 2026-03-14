"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { ProductType } from "@/graphql/enums.graphql";
import { ProductVoucherEntity } from "@/modules/product-vouchers/product-vouchers-types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
import { productTypes } from "../products/products-constants";
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
          icon={productTypes[ProductType.Voucher].icon}
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
            • {t`Voucher amount`}: <CurrencyFormat value={voucher.remainAmount} />/
            <CurrencyFormat value={voucher.amount} />
          </Text>

          <Renderer visible={!!voucher.productVoucher.voucherExpireInDays}>
            <Text fw={500} fz={em(13)} c="gray">
              • <Trans>Expire date</Trans>:{" "}
              <DateFormat
                value={
                  voucher.createdAt + voucher.productVoucher.voucherExpireInDays! * 60 * 60 * 24
                }
                type="date"
              />
            </Text>
          </Renderer>

          <Renderer visible={!!!props.hideCustomer}>
            <Text fw={500} fz={em(13)} c="gray">
              • <Trans>Customer</Trans>: {voucher.customer.name}
            </Text>
          </Renderer>

          <Renderer
            visible={
              !!voucher.productVoucher.voucherIncludeProducts &&
              voucher.productVoucher.voucherIncludeProducts.length > 0
            }
          >
            <Text fw={500} fz={em(13)} c="gray">
              • <Trans>Include products</Trans>:
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
