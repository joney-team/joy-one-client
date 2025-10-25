import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { CategoryType } from "./category-types";

export const categoryTypes: Record<CategoryType, { color: MantineColor; label: () => string }> = {
  [CategoryType.COMMON]: { color: "blue", label: () => t`General` },
  [CategoryType.PRODUCTS]: { color: "green", label: () => t`Products` },
  [CategoryType.POSTS]: { color: "yellow", label: () => t`Posts` },
};
