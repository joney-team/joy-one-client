import { useMantineColorScheme } from "@mantine/core";
import { useColorScheme as useCoreColorScheme } from "@mantine/hooks";

export const useColorScheme = () => {
  const mantineColorScheme = useMantineColorScheme();
  const colorSchemes = useCoreColorScheme();
  return mantineColorScheme.colorScheme === "auto" ? colorSchemes : mantineColorScheme.colorScheme;
};
