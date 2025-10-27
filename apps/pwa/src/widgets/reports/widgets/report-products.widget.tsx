"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { Empty } from "@/components/empty";
import { FlexSize } from "@/components/flex-size";
import { Renderer } from "@/components/renderer";
import { SectionTitle } from "@/components/session-title";
import { num } from "@/modules/lang/lang-service";
import { productTypes } from "@/modules/products/products-constants";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductType } from "@/modules/products/products-types";
import { ReceiptReportItem } from "@/modules/receipts/receipts-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WidgetProps } from "@/widgets/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  em,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import {
  IconChevronDown,
  IconChevronUp,
  IconClipboardList,
  IconReportAnalytics,
} from "@tabler/icons-react";
import Link from "next/link";
import { FC, useRef, useState } from "react";
import { ReportWidgetsContext } from "../types";

export const ReportProductsWidget: FC<WidgetProps<ReportWidgetsContext>> = (props) => {
  const filterState = useRef<any>({});
  const forceUpdate = useForceUpdate();
  const workspace = useWorkspace();
  const color = useColor();

  const setFilterState = (key: string, value: any) => {
    filterState.current[key] = value;
    forceUpdate();
  };

  const groupByProducts = props.ctx.rangeReports.reduce<{
    [productId: string]: {
      productId: string;
      productName: string;
      productType: ProductType;
      items: ReceiptReportItem[];
      revenue: number;
      profit: number;
      qtySold: number;
    };
  }>((acc, report) => {
    report.receipts.items.forEach((item) => {
      const productEntity = item.relatedEntities.find((v) => v.type === "PRODUCT");
      if (productEntity) {
        if (!acc[productEntity.data._id]) {
          acc[productEntity.data._id] = {
            productId: productEntity.data._id,
            productName: productEntity.data.name,
            productType: productEntity.data.type,
            items: [],
            revenue: 0,
            profit: 0,
            qtySold: 0,
          };
        }

        const existed = acc[productEntity.data._id].items.find((v) => v.ref === item.ref);
        if (!existed) {
          acc[productEntity.data._id].items.push(item);
          acc[productEntity.data._id].revenue += item.revenue;
          acc[productEntity.data._id].profit += item.profit;
          acc[productEntity.data._id].qtySold += item.relatedEntities.reduce((acc, v) => {
            if (v.type === "PRODUCT" && v.data._id === productEntity.data._id) {
              return acc + v.data.qty;
            } else {
              return acc;
            }
          }, 0);
        }
      }
    });

    return acc;
  }, {});

  const _groupByProducts = Object.keys(groupByProducts)
    .map((productId) => groupByProducts[productId])
    .filter((v) => {
      if (filterState.current.productType) {
        return v.productType === filterState.current.productType;
      }

      return true;
    })
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <Card shadow="xs" p={0} w="100%" h="100%">
      <Stack h="100%">
        <Stack px={16} pt={16}>
          <SectionTitle name={t`Products & services`} icon={IconReportAnalytics} />

          <Renderer visible={props.ctx.isFetching}>
            <Skeleton h="100%" />
          </Renderer>
        </Stack>

        <Empty
          h="100%"
          hideBorder
          visible={!props.ctx.isFetching && Object.keys(groupByProducts).length === 0}
        />

        <Renderer visible={!props.ctx.isFetching && Object.keys(groupByProducts).length > 0}>
          <Group gap={10} px={16}>
            {Object.values(ProductType).map((v) => {
              const isActive = filterState.current.productType === v;
              const Icon = getProductIcon(v);
              const count = Object.keys(groupByProducts)
                .map((productId) => groupByProducts[productId])
                .filter((productReport) => productReport.productType === v).length;

              return (
                <Button
                  key={v}
                  variant={isActive ? "filled" : "outline"}
                  size="compact-md"
                  radius={100}
                  fz={13}
                  leftIcon={Icon}
                  iconSize={16}
                  px={10}
                  onClick={() => {
                    if (isActive) {
                      setFilterState("productType", undefined);
                    } else {
                      setFilterState("productType", v);
                    }
                  }}
                >
                  {productTypes[v].label()}

                  <Circle
                    ml={10}
                    size="xs"
                    bg={!isActive ? color("primary") : color("white")}
                    c={!isActive ? color("white") : color("primary")}
                    label={num(count)}
                    disabled={count === 0}
                  />
                </Button>
              );
            })}
          </Group>

          <FlexSize>
            {(size) => {
              return (
                <ScrollArea.Autosize mah={size.height}>
                  <Stack px={16}>
                    <Empty visible={_groupByProducts.length === 0} />

                    <Renderer visible={_groupByProducts.length > 0}>
                      <Table striped withRowBorders withTableBorder withColumnBorders stickyHeader>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th w={40}>#</Table.Th>
                            <Table.Th>{t`Name`}</Table.Th>
                            <Table.Th w={80} ta="right">
                              {t`QTY`}
                            </Table.Th>
                            <Table.Th w={200} ta="right">
                              {t`Revenue`}
                            </Table.Th>
                            {workspace.hasPermission(WorkspacePermission.REPORTS_VIEW) && (
                              <Table.Th w={200} ta="right">
                                {t`Profit`}
                              </Table.Th>
                            )}
                          </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                          {_groupByProducts.map((productReport, i) => {
                            return (
                              <Table.Tr key={productReport.productId}>
                                <Table.Td>{i + 1}</Table.Td>
                                <Table.Td>
                                  <Stack gap={3}>
                                    <Anchor
                                      fw={600}
                                      c="dark"
                                      component={Link}
                                      href={`/${productReport.productType.toLowerCase()}s/${
                                        productReport.productId
                                      }`}
                                    >
                                      {productReport.productName}
                                    </Anchor>

                                    <RelatedItems items={productReport.items} />
                                  </Stack>
                                </Table.Td>
                                <Table.Td w={80} ta="right">
                                  {num(productReport.qtySold)}
                                </Table.Td>
                                <Table.Td w={200} ta="right">
                                  {num(productReport.revenue, { type: "money" })}
                                </Table.Td>
                                {workspace.hasPermission(WorkspacePermission.REPORTS_VIEW) && (
                                  <Table.Td w={200} ta="right">
                                    {num(productReport.profit, { type: "money" })}
                                  </Table.Td>
                                )}
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </Renderer>
                  </Stack>
                </ScrollArea.Autosize>
              );
            }}
          </FlexSize>
        </Renderer>
      </Stack>
    </Card>
  );
};

const RelatedItems: FC<{ items: ReceiptReportItem[] }> = ({ items }) => {
  const [isShow, setIsShow] = useState(false);

  const workspace = useWorkspace();
  const moduleOrder = workspace.getModule("orders");

  return (
    <Stack gap={8}>
      <Anchor className="unselectable" fz={em(12)} onClick={() => setIsShow((s) => !s)}>
        <Group gap={3}>
          <ThemeIcon size="xs" variant="transparent">
            <IconClipboardList />
          </ThemeIcon>
          <Trans>
            {num(items.length)} related to {t`Receipts`.toLowerCase()} / {moduleOrder?.name()}
          </Trans>
          <ActionIcon variant="subtle" size="xs">
            {!isShow ? <IconChevronDown /> : <IconChevronUp />}
          </ActionIcon>
        </Group>
      </Anchor>

      {isShow && (
        <Group maw="100%">
          {items.map((item, i) => {
            const receipt = item.relatedEntities.find((v) => v.type === "RECEIPT");
            const order = item.relatedEntities.find((v) => v.type === "ORDER");
            const product = item.relatedEntities.find((v) => v.type === "PRODUCT");

            return (
              <Card withBorder shadow="none" p={8} key={i} maw="100%" w={220}>
                {!!order && (
                  <Group justify="space-between">
                    <Text fz={16}>{moduleOrder?.name()}</Text>
                    <Anchor component={Link} href={`/orders/${order?.data.code}`}>
                      <Text fw={700} fz={em(13)}>
                        #{order.data.code}
                      </Text>
                    </Anchor>
                  </Group>
                )}

                {!!receipt && (
                  <Group justify="space-between">
                    <Text fz={16}>{t`Receipt`}</Text>
                    <Anchor component={Link} href={`/receipts/${receipt?.data.id}`}>
                      <Text fw={700} fz={em(13)}>
                        {renderEntityCode(receipt?.data.code)}
                      </Text>
                    </Anchor>
                  </Group>
                )}

                {!!product && (
                  <Group justify="space-between">
                    <Text fz={16}>{t`QTY`}</Text>
                    <Text fw={700} fz={em(13)}>
                      {num(product.data.qty)}
                    </Text>
                  </Group>
                )}
              </Card>
            );
          })}
        </Group>
      )}
    </Stack>
  );
};
