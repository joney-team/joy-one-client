"use client";

import { useColor } from "@/modules/theme/use-color";
import {
  ColorInput,
  Group,
  MantineColor,
  parseThemeColor,
  SimpleGrid,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconDropletOff } from "@tabler/icons-react";
import { FC, useEffect, useMemo, useState } from "react";

interface AppColorInputProps {
  color?: string | null;
  onChange: (color?: string | null) => void;
}

const colorOptions: MantineColor[] = [
  "none",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
];

export const AppColorInput: FC<AppColorInputProps> = (props) => {
  const color = useColor();
  const theme = useMantineTheme();
  const [colorInputValue, setColorInputValue] = useState<string>(
    parseThemeColor({ color: props.color, theme })?.value ?? props.color
  );

  const safeParseThemeColor = (color: string | null | undefined) => {
    try {
      return parseThemeColor({ color: color, theme })?.value ?? null;
    } catch (error) {
      return null;
    }
  };

  const onChange = (color: string | null) => {
    try {
      const parsedColor = safeParseThemeColor(color);
      props.onChange(parsedColor);
      setColorInputValue(parsedColor ?? "");
    } catch (error) {
      props.onChange(null);
    }
  };

  const onChangeDebounced = useDebouncedCallback((color: string | null) => {
    onChange(color);
  }, 500);

  useEffect(() => {
    onChangeDebounced(colorInputValue);
  }, [colorInputValue]);

  return (
    <Stack gap={8}>
      <SimpleGrid cols={6} spacing={3}>
        {colorOptions.map((option) => {
          const isSelected =
            option === "none" ? props.color === null : props.color === safeParseThemeColor(option);

          const optionColor = option === "none" ? color("gray.1") : color(option);

          return (
            <Group
              key={option}
              w={30}
              h={30}
              style={{
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: isSelected ? color("gray.4") : "transparent",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              align="center"
              justify="center"
              onClick={() => {
                onChange(option === "none" ? null : option);
              }}
              p={2}
            >
              <Group w="100%" h="100%" p={3} bg={optionColor} style={{ borderRadius: "50%" }}>
                {option === "none" && (
                  <IconDropletOff size={16} strokeWidth={2} color={color("gray.6")} />
                )}
              </Group>
            </Group>
          );
        })}
      </SimpleGrid>

      <ColorInput
        w={195}
        value={colorInputValue}
        onChange={(color) => setColorInputValue(color ?? null)}
        withPicker={false}
      />
    </Stack>
  );
};

export const useParsedAppColor = (color: string | null) => {
  const theme = useMantineTheme();

  const parsedColor = useMemo(() => {
    try {
      if (!color) return null;
      return parseThemeColor({ color: color, theme })?.value ?? color;
    } catch (error) {
      return color;
    }
  }, [color, theme]);

  return parsedColor;
};
