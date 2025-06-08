import type { ProductCategoryEntity } from "@/modules/product-categories/product-category-types";
import { useDebouncedCallback } from "@mantine/hooks";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { FC, FormEventHandler } from "react";
import { removeProductCategory, updateProductCategory } from "./product-category-service";
import { onArchive } from "@/utils/actions";
import { IconTrash } from "@tabler/icons-react";

export const ProductCategoryCard: FC<{ category: ProductCategoryEntity }> = (props) => {
  const onChangeName: FormEventHandler<HTMLParagraphElement> = useDebouncedCallback((e) => {
    const value = e.target.textContent;
    if (!value) return;
    updateProductCategory(props.category._id, {
      ...props.category,
      name: value,
    });
  }, 500);

  return (
    <Card withBorder shadow="none">
      <Stack>
        <Group justify="space-between">
          <Text contentEditable onBlur={onChangeName} dangerouslySetInnerHTML={{ __html: props.category.name }} />

          <ActionIcon
            variant="transparent"
            size="xs"
            color="gray"
            onClick={() =>
              onArchive({
                name: props.category.name,
                process: () => removeProductCategory(props.category._id),
              })
            }
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
};
