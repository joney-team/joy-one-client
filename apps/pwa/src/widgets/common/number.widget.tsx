"use client";

import { Renderer } from "@/components/renderer";
import { num } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { resizeArrayForSparkline } from "@/utils/chart.utils";
import { WidgetComponent, WidgetLayoutConfig } from "@/widgets/types";
import {
  ActionIcon,
  Box,
  Card,
  em,
  getGradient,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const Sparkline = dynamic(() => import("@mantine/charts").then((mod) => mod.Sparkline), {
  ssr: false,
});

export const numberWidgetlayoutConfig: WidgetLayoutConfig = {
  initW: 4,
  initH: 3,
  minW: 4,
  minH: 3,
};

export interface NumberReportWidget<CT = any> {
  type?: "money" | "hours";
  renderValue: (ctx: CT) => number | undefined;
  renderSparkline?: (ctx: CT) => number[];
  onClick?: (ctx: CT) => void;
  unit?: string;
  boxColor?: (ctx: CT) => string;
  isLoading?: (ctx: CT) => boolean;
  tooltip?: (ctx: CT) => string | null;
}

export function numberWidget<CT = any>(args: NumberReportWidget<CT>): WidgetComponent<CT> {
  return (props) => {
    const color = useColor();
    const colorScheme = useColorScheme();

    const { ctx, config, widgetsContext, id } = props;
    const Icon = config.icon || IconInfoCircle;
    const theme = useMantineTheme();

    const getValue = () => {
      try {
        const val = args.renderValue(ctx);
        return val;
      } catch (error) {
        return 0;
      }
    };

    const name = config.name;
    const value = num(getValue(), { type: args.type });
    const sparkline = args.renderSparkline ? args.renderSparkline(ctx) : undefined;
    const isLoading = args.isLoading ? args.isLoading(ctx) : typeof value === "undefined";

    const boxColor = args.boxColor
      ? args.boxColor(ctx)
      : widgetsContext.getState(id, "color") || "primary";
    const isDarkContent = widgetsContext.getState(id, "style") === "dark-content";
    const contentColor = isDarkContent ? "white" : "var(--mantine-color-bright)";
    const iconColor = isDarkContent ? "white" : color(boxColor);
    const iconVariant = "light";

    const isShowSparkline = sparkline && sparkline.filter((v) => v !== 0).length > 1;
    const tooltip = args.tooltip?.(ctx);

    return (
      <Card
        w="100%"
        h="100%"
        shadow="xs"
        p={12}
        style={{
          background: isDarkContent
            ? getGradient(
                {
                  from: color(colorScheme === "light" ? `${boxColor}.5` : `${boxColor}.8`),
                  to: color(colorScheme === "light" ? `${boxColor}.8` : `${boxColor}.9`),
                  deg: 90,
                },
                theme
              )
            : undefined,
        }}
      >
        <Group h="100%" justify="space-between" wrap="nowrap" gap={0} align="center">
          <Group wrap="nowrap" gap={10}>
            {!!args.onClick ? (
              <ActionIcon
                onClick={() => args.onClick?.(ctx)}
                color={iconColor}
                variant={iconVariant}
                size="xl"
              >
                <Icon size={30} strokeWidth={1.2} />
              </ActionIcon>
            ) : (
              <ThemeIcon color={iconColor} variant={iconVariant} size="xl">
                <Icon size={30} strokeWidth={1.2} />
              </ThemeIcon>
            )}

            <Tooltip label={tooltip} disabled={!tooltip}>
              <Stack gap={2}>
                <Text c={contentColor} fz={11} fw={400}>
                  {name()}
                </Text>
                <Group h={20} align="center">
                  {isLoading ? (
                    <Skeleton h={18} w={100} opacity={isDarkContent ? 0.2 : 1} />
                  ) : (
                    <Text c={contentColor} fw={500} fz={em(16)}>
                      {`${value} ${args.unit || ""}`.trim()}
                    </Text>
                  )}
                </Group>
              </Stack>
            </Tooltip>
          </Group>

          <Renderer visible={isShowSparkline}>
            <Box
              onClick={() => args.onClick?.(ctx)}
              style={{ cursor: args.onClick ? "pointer" : undefined }}
            >
              <Sparkline
                w={50}
                h={30}
                data={resizeArrayForSparkline(sparkline || [], 15)}
                curveType="monotone"
                color={iconColor}
                fillOpacity={0.6}
                strokeWidth={1}
              />
            </Box>
          </Renderer>
        </Group>
      </Card>
    );
  };
}
