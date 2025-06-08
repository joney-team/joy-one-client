import { type FC } from "react";
import { Container } from "@/components/container";
import { Empty } from "@/components/empty";
import { useCategories } from "@/modules/product-categories/product-category-service";
import { Stack } from "@mantine/core";
import { ProductCategoryCard } from "./product-category-card";

export const ProductCategoryList: FC = () => {
  const [categories] = useCategories();

  return (
    <Container p={16}>
      <Stack>
        <Empty visible={categories.length === 0} />
        {categories.map((category) => {
          return <ProductCategoryCard category={category} key={category._id} />;
        })}
      </Stack>
    </Container>
  );
};
