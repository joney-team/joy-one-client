import { MantineColor } from "@mantine/core";
import { CategoryType } from "./category-types";

export const categoryTypeConfigs: Record<CategoryType, { color: MantineColor }> = {
  [CategoryType.POSTS]: { color: "blue" },
  [CategoryType.PRODUCTS]: { color: "green" },
};