import { getGradient, getThemeColor, MantineTheme, useMantineTheme } from "@mantine/core";
import { useColorScheme } from "./use-color-scheme";
import { backgroundColors } from "@joy-one-client/config/colors";
import { useMemo } from "react";

export const getColor = (theme: MantineTheme, color?: string) => {
  if (!color) return "";
  if (color && color.includes("#")) return color;

  let _color = color || "dark";
  if (color && color.includes("primary")) {
    _color = color.replace("primary", theme.primaryColor);
  }

  return getThemeColor(_color, theme);
};

export const useColor = () => {
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();

  const color = useMemo(() => {
    return (color?: string | { light?: string; dark?: string }): string => {
      if (!color) return "";

      if (typeof color === "string" && ["background", "bg"].includes(color)) {
        return backgroundColors[colorScheme];
      }

      if (typeof color === "string") {
        return getColor(theme, color);
      }

      return getColor(theme, color[colorScheme]);
    };
  }, [colorScheme, theme]);

  return color;
};

export const useGradient = () => {
  const theme = useMantineTheme();

  const gradient = (deg = 90) =>
    getGradient(
      {
        from: getColor(theme, "primary.5"),
        to: getColor(theme, "primary.7"),
        deg,
      },
      theme
    );

  return gradient;
};
