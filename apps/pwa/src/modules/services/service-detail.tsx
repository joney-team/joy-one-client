import { Errored } from "@/components/errored";
import { EventList } from "@/components/event-list";
import { EventType } from "@/modules/events/event-types";
import { archiveProduct, getProduct } from "@/modules/products/products-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { Center, Skeleton, Stack, Text } from "@mantine/core";
import { IconArchive } from "@tabler/icons-react";
import { FC, useEffect } from "react";

import { useRouter } from "@/hooks/use-router";
import { Button } from "@/components/buttons/button";
import { ProductCard } from "@/modules/products/product-card";
import { onArchive } from "@/utils/actions";
import { useLayout } from "@/layout/layout-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useParams } from "next/navigation";

export const ServiceDetail: FC = () => {
  const workspace = useWorkspace();
  const router = useRouter();
  const layout = useLayout();

  const params = useParams();
  const serviceId = params.id as string;
  const product = useFetch({
    fetch: async () => getProduct(serviceId),
    events: {
      types: [EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED],
      condition: (e, _product) =>
        e.ref === _product._id || (e.relatedEntities || []).some((v) => v.id === _product._id),
    },
  });

  useEffect(() => {
    if (product.data) {
      layout.setComponents({ head: product.data.name });
    }
  }, [product.data]);

  return (
    <Stack p={16}>
      {!product.isInitialized && <Skeleton height={200} />}
      {!!product.error && <Errored error={product.error} />}
      {product.data && (
        <>
          <ProductCard product={product.data} />
          <EventList ref={serviceId} />

          {workspace.hasPermission(WorkspacePermission.PRODUCTS_SERVICES_WRITE) && (
            <Center>
              <Button
                h={25}
                variant="subtle"
                color="gray"
                leftSection={<IconArchive strokeWidth={1.3} size={16} style={{ marginRight: -5 }} />}
                onClick={() =>
                  onArchive({
                    name: "Dịch vụ",
                    process: () => archiveProduct(serviceId),
                    onArchived: () => router.back(),
                  })
                }
              >
                <Text fz={12} fw={400}>
                  Xoá
                </Text>
              </Button>
            </Center>
          )}
        </>
      )}
    </Stack>
  );
};
