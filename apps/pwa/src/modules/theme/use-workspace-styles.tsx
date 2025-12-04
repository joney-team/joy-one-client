import { useEffect } from "react";
import { useColor } from "./use-color";
import { useColorScheme } from "./use-color-scheme";

export const useWorkspaceStyles = () => {
  const colorScheme = useColorScheme();
  const color = useColor();

  useEffect(() => {
    const variables = {
      "--app-divider-color": color({ light: "gray.2", dark: "dark.5" }),
      "--app-background-color": color({ light: "#f3f3f3", dark: "#242424" }),
      "--app-background-pattern-color": color({ light: "#bcbcbc", dark: "#3f3f3f" }),
    };

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    return () => {
      Object.entries(variables).forEach(([key]) => {
        document.documentElement.style.removeProperty(key);
      });
    };
  }, [colorScheme]);

  useEffect(() => {
    const backgroundColor = `var(--app-background-color)`;
    const patternColor = `var(--app-background-pattern-color)`;

    document.body.style.setProperty("background-color", backgroundColor);
    document.body.style.setProperty(
      "background-image",
      `radial-gradient(${patternColor} 0.6px, ${backgroundColor} 0.6px)`
    );
    document.body.style.setProperty("background-size", "12px 12px");

    return () => {
      document.body.style.removeProperty("background-color");
      document.body.style.removeProperty("background-image");
      document.body.style.removeProperty("background-size");
    };
  }, [colorScheme]);
};
