"use client";

import { Errored } from "@/components/errored";
import { EventType } from "@/graphql/enums.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Center, Skeleton, Stack, Text } from "@mantine/core";
import { IconArchive } from "@tabler/icons-react";
import { FC, Fragment, useEffect } from "react";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { ProductCard } from "@/modules/products/components/product-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { onArchive } from "@/utils/actions";
import { nonLoading } from "@/utils/non-loading";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEventsListener } from "../events/event-service";
import ArchiveProductDocument from "../products/graphql/archiveProduct.graphql";
import GetProductByIdDocument from "../products/graphql/getProductById.graphql";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const ServiceDetail: FC = () => {
  const workspace = useWorkspace();
  const client = useApolloClient();
  const router = useRouter();
  const layout = useLayout();

  const params = useParams<{ id: string }>();

  const { data, loading, error, refetch } = useQuery(GetProductByIdDocument, {
    variables: { productId: params.id },
  });

  useEventsListener([EventType.ProductUpdate, EventType.ProductArchived], () => refetch());

  useEffect(() => {
    if (data) {
      layout.setComponents({ head: data.product.name });
    }
  }, [data]);

  return (
    <Container size="md" p="md">
      <Stack gap={30}>
        {loading && <Skeleton height={200} />}
        {error && <Errored error={error} />}
        {data && (
          <Fragment>
            <ProductCard product={data.product} />
            <EventsList ref={params.id} />

            {workspace.hasPermission(WorkspacePermission.PRODUCTS_SERVICES_WRITE) && (
              <Center>
                <Button
                  h={25}
                  variant="subtle"
                  color="gray"
                  leftSection={
                    <IconArchive strokeWidth={1.3} size={16} style={{ marginRight: -5 }} />
                  }
                  onClick={() =>
                    onArchive({
                      name: data.product?.name,
                      process: async () => {
                        await client.mutate({
                          mutation: ArchiveProductDocument,
                          variables: { productId: params.id },
                        });
                        router.back();
                      },
                    })
                  }
                >
                  <Text fz={12} fw={400}>
                    <Trans>Archive</Trans>
                  </Text>
                </Button>
              </Center>
            )}
          </Fragment>
        )}
      </Stack>
    </Container>
  );
};
