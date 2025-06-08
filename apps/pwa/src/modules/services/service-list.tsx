import { type FC } from "react";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { ProductCard } from "@/modules/products/product-card";
import { OnProductModal } from "@/modules/products/modal-product";
import { EventType } from "@/modules/events/event-types";
import { num } from "@/modules/lang/lang-service";
import { getProducts } from "@/modules/products/products-service";
import { ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Stack, Text } from "@mantine/core";
import { IconCategory2, IconEdit } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export const ServiceList: FC = () => {
  const router = useRouter();

  return (
    <Stack p={16}>
      <List
        id="sers"
        name="services"
        icon={IconCategory2}
        fetch={(p) => getProducts({ ...p, type: ProductType.SERVICE })}
        creatable={{
          onCreate: () => OnProductModal({ type: ProductType.SERVICE }),
          permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        }}
        columns={{
          name: {
            render: ({ data }) => {
              return (
                <Clickable onClick={() => router.push(`/services/${data._id}`)}>
                  <Text>{data.name}</Text>
                </Clickable>
              );
            },
          },
          unit: {
            w: 150,
          },
          price: {
            w: 250,
            align: "right",
            isSortable: true,
            render: ({ data }) => {
              if (data.minPrice && data.maxPrice) {
                return (
                  <Text>
                    {num(data.minPrice)} - {num(data.maxPrice, { type: "money" })}
                  </Text>
                );
              }

              return <Text>{num(data.price, { type: "money" })}</Text>;
            },
          },
        }}
        card={({ data }) => <ProductCard product={data} />}
        events={[EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED]}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            onClick: (data) => OnProductModal({ type: ProductType.SERVICE, product: data }),
          },
        ]}
      />
    </Stack>
  );
};
