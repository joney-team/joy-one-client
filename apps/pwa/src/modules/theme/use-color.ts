import { getGradient, getThemeColor, MantineTheme, useMantineTheme } from "@mantine/core";
import { useColorScheme } from "./use-color-scheme";

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

  return (color?: string | { light?: string; dark?: string }): string => {
    if (!color) return "";

    if (typeof color === "string") {
      return getColor(theme, color);
    }

    return getColor(theme, color[colorScheme]);
  };
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