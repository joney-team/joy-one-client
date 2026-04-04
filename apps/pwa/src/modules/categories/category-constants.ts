import { CategoryType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const categoryTypes: Record<
  CategoryType,
  { color: MantineColor; label: MacroMessageDescriptor }
> = {
  [CategoryType.Common]: { color: "blue", label: defineMessage`General` },
  [CategoryType.Products]: { color: "green", label: defineMessage`Products` },
  [CategoryType.Posts]: { color: "yellow", label: defineMessage`Posts` },
};
