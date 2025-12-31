"use client";

import { FlexSizeLegacy } from "@/components/flex-size-legacy";
import { useColor } from "@/modules/theme/use-color";
import type { WidgetComponent, WidgetLayoutConfig } from "@/widgets/widgets-types";
import { Trans } from "@lingui/react/macro";
import { Card, em, Group, LoadingOverlay, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const LineChart = dynamic(() => import("@mantine/charts").then((mod) => mod.LineChart), {
  ssr: false,
});

export const chartWidgetlayoutConfig: WidgetLayoutConfig = {
  initW: 6,
  initH: 12,
  minW: 4,
  minH: 12,
};

export interface NumberReportWidget<CT = any> {
  onClick?: (ctx: CT) => void;
  loading?: (ctx: CT) => boolean;
  renderData?: (ctx: CT) => undefined | any[];
  renderSeries?: (ctx: CT) => { name: string; color: string; label?: string }[];
  unit?: (ctx: CT) => string | { short?: string; full: string };
}

export function chartWidget<CT = any>(args: NumberReportWidget<CT>): WidgetComponent<CT> {
  return (props) => {
    const color = useColor();
    const { ctx, config } = props;
    const Icon = config.icon || IconInfoCircle;
    const name = config.name;

    const data = args.renderData?.(ctx);
    const isLoading = args.loading?.(ctx);

    const propUnit = args.unit?.(ctx);
    const unit = typeof propUnit === "string" ? { full: propUnit } : propUnit;

    const min = Math.min(...(data || []).map((v) => v.value));
    const max = Math.max(...(data || []).map((v) => v.value));
    const mean = (min + max) / 2;

    return (
      <Card w="100%" h="100%" shadow="xs" p={16}>
        <Stack gap={20} h="100%">
          <Group ml={-5} justify="space-between">
            <Group gap={3}>
              <ThemeIcon variant="subtle">
                <Icon size={em(25)} strokeWidth={1.5} color={color("primary")} />
              </ThemeIcon>
              <Text fz={em(15)} fw={400}>
                {name()}
              </Text>
            </Group>
            {unit && (
              <Text fz={em(12)} fw={400}>
                <Trans>Unit</Trans>: {unit?.full}
              </Text>
            )}
          </Group>

          <FlexSizeLegacy>
            {(size) => {
              return (
                <Stack pos="relative" style={{ height: size.height }}>
                  <LineChart
                    h={size.height}
                    ml={-4}
                    data={data || []}
                    dataKey="date"
                    series={(args.renderSeries?.(ctx) || []).map((v) => ({
                      ...v,
                      color: color(v.color),
                      value: v.label,
                    }))}
                    curveType="monotone"
                    style={{ outline: "none" }}
                    unit={unit?.short ? unit.short : undefined}
                    tooltipAnimationDuration={200}
                    referenceLines={
                      mean !== 0
                        ? [
                            {
                              y: mean,
                              color: color(mean > 0 ? "primary.2" : "red.2"),
                            },
                          ]
                        : []
                    }
                  />

                  <LoadingOverlay visible={isLoading} overlayProps={{ radius: "xs" }} />
                </Stack>
              );
            }}
          </FlexSizeLegacy>
        </Stack>
      </Card>
    );
  };
}
