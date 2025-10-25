"use client";

import { useRouter } from "@/hooks/use-router";
import { num } from "@/modules/lang/lang-service";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import {
  ActionIcon,
  Badge,
  Card,
  CardProps,
  Group,
  Stack,
  Text,
  ThemeIcon,
  em,
} from "@mantine/core";
import {
  IconBuildingWarehouse,
  IconClock,
  IconEye,
  IconGiftCard,
  IconInfoCircle,
  IconList,
  IconPencil,
  IconReportMoney,
  IconStack,
} from "@tabler/icons-react";
import { FC } from "react";
import { EntityImage } from "../../../components/entity-image";
import { Renderer } from "../../../components/renderer";

export const ProductCard: FC<
  {
    product: ProductEntity;
    preventLink?: boolean;
    onClick?: () => void;
    isHideEdit?: boolean;
    imageSize?: number;
  } & CardProps
> = (props) => {
  const { product, isHideEdit, preventLink, onClick, imageSize = 80, ...rest } = props;
  const router = useRouter();
  const workspace = useWorkspace();
  const Icon = getProductIcon(product.type);

  return (
    <Card
      withBorder
      className="unselectable"
      p={10}
      onClick={() => {
        if (onClick) return onClick();
        if (preventLink) return;
        if (product.type === ProductType.SERVICE) router.push(`/services/${product._id}`);
        if (product.type === ProductType.PRODUCT) router.push(`/products/${product._id}`);
      }}
      style={{ cursor: "pointer" }}
      {...rest}
    >
      <Group align="start">
        <EntityImage src={product.image} size={imageSize} onlyRead icon={Icon} />
        <Stack gap={8} flex={1}>
          <Stack flex={1} gap={5}>
            <Text fw={600}>{product.name}</Text>

            {!!product.displayName && (
              <Group gap={5}>
                <ThemeIcon size="xs" color="dark" radius={100}>
                  <IconEye size={13} />
                </ThemeIcon>
                <Text fz={em(15)} c="dark" fw={500}>
                  {product.displayName}
                </Text>
              </Group>
            )}
          </Stack>

          <Stack gap={8}>
            <Group gap={5}>
              <ThemeIcon variant="transparent" size="xs" color="dark" radius={100} ml={-3}>
                <IconReportMoney size={20} />
              </ThemeIcon>
              <Text fz={em(15)} c="dark" fw={500}>
                {(function () {
                  if (typeof product.minPrice === "number" && typeof product.maxPrice === "number")
                    return `${num(product.minPrice, { type: "money" })} - ${num(product.maxPrice, {
                      type: "money",
                    })}`;
                  return num(product.price, { type: "money" });
                })()}{" "}
                / {product.unit}
              </Text>
            </Group>

            <Renderer visible={product.type === ProductType.COMBO}>
              {product.combos?.map((combo, i) => {
                const ComboIcon = getProductIcon(combo.product.type);
                return (
                  <Group key={i} gap={5}>
                    <ThemeIcon variant="transparent" size="xs" color="dark" radius={100} ml={-3}>
                      <ComboIcon size={20} />
                    </ThemeIcon>

                    <Text fz={em(15)} c="dark" fw={500}>
                      x{num(combo.quantity)} {combo.product.name}
                    </Text>
                  </Group>
                );
              })}

              <Group gap={5}>
                <ThemeIcon variant="transparent" size="xs" color="dark" radius={100} ml={-3}>
                  <IconClock size={20} />
                </ThemeIcon>

                <Text fz={em(15)} c="dark" fw={500}>
                  {t`Expire in`}:{" "}
                  {product.combosExpireInDays && product.combosExpireInDays > 0
                    ? `${num(product.combosExpireInDays)} ${t`days`}`
                    : t`Unlimited`}
                </Text>
              </Group>
            </Renderer>

            <Renderer visible={!!product.category}>
              <Group gap={5}>
                <ThemeIcon variant="transparent" color="dark" size="xs" radius={100} ml={-3}>
                  <IconList size={18} />
                </ThemeIcon>
                <Text fz={em(15)} fw={500}>
                  {product.category?.name}
                </Text>
              </Group>
            </Renderer>

            {product.supplies && product.supplies.length > 0 && (
              <Group gap={5}>
                <ThemeIcon variant="transparent" color="dark" size="xs" radius={100} ml={-3}>
                  <IconStack size={18} />
                </ThemeIcon>
                <Text fz={em(15)} fw={500}>
                  {num(product.supplies.length)} {t`Consumables`}
                </Text>
              </Group>
            )}

            <Renderer visible={product.type === ProductType.VOUCHER}>
              <Group gap={5}>
                <ThemeIcon variant="transparent" size="xs" color="dark" radius={100} ml={-3}>
                  <IconGiftCard size={20} />
                </ThemeIcon>

                <Text fz={em(15)} c="dark" fw={500}>
                  {t`Voucher amount`}: {num(product.voucherAmount, { type: "money" })}
                </Text>
              </Group>

              <Group gap={5} align="start">
                <ThemeIcon mt={2} variant="transparent" size="xs" color="dark" radius={100} ml={-3}>
                  <IconInfoCircle size={20} />
                </ThemeIcon>

                <Stack gap={3}>
                  <Text fz={em(15)} c="dark" fw={500}>
                    {t`Terms of use`}:
                  </Text>

                  <Renderer
                    visible={
                      !!product.voucherIncludeProducts && product.voucherIncludeProducts.length > 0
                    }
                  >
                    <Text fw={500} fz={em(13)} c="gray">
                      • {`${t`Include products`}:`}
                    </Text>
                    {product.voucherIncludeProducts?.map((product) => {
                      return (
                        <Text key={product._id} fw={500} fz={em(13)} c="gray" pl={10}>
                          - {product.name}
                        </Text>
                      );
                    })}
                  </Renderer>

                  <Renderer
                    visible={
                      !!product.voucherExcludeProducts && product.voucherExcludeProducts.length > 0
                    }
                  >
                    <Text fw={500} fz={em(13)} c="gray">
                      • {`${t`Exclude products`}:`}
                    </Text>
                    {product.voucherExcludeProducts?.map((product) => {
                      return (
                        <Text key={product._id} fw={500} fz={em(13)} c="gray" pl={10}>
                          - {product.name}
                        </Text>
                      );
                    })}
                  </Renderer>

                  <Renderer
                    visible={
                      (!product.voucherExcludeProducts ||
                        product.voucherExcludeProducts.length === 0) &&
                      (!product.voucherIncludeProducts ||
                        product.voucherIncludeProducts.length === 0)
                    }
                  >
                    <Text fw={500} fz={em(13)} c="gray">
                      • {`${t`Apply all products`}`}
                    </Text>
                  </Renderer>
                </Stack>
              </Group>
            </Renderer>
          </Stack>

          {product.isStockCheck && product.stock && (
            <Group justify="space-between">
              <Badge
                leftSection={
                  <IconBuildingWarehouse size={13} strokeWidth={1.8} style={{ marginRight: -3 }} />
                }
                variant={product.stock.quantity > 0 ? "light" : "outline"}
                color={product.stock.quantity <= 0 ? "gray" : undefined}
                fz={10}
                px={8}
              >
                {product.stock.quantity <= 0 ? t`Out of stock` : num(product.stock.quantity)}
              </Badge>
            </Group>
          )}
        </Stack>

        {!isHideEdit && workspace.hasPermission(WorkspacePermission.PRODUCTS_SERVICES_WRITE) && (
          <ActionIcon
            variant="subtle"
            color="gray"
            radius={100}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              OnProductModal({ product, type: product.type });
            }}
          >
            <IconPencil size={18} />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
};
