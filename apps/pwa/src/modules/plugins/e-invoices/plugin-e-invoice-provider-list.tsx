"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { useColor } from "@/modules/theme/use-color";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { type FC } from "react";
import GetEInvoiceProvidersDocument from "./graphql/getEInvoicesProviders.graphql";
import { OnModalEInvoiceProvider } from "./components/modal-e-invoice-provider";
import { PluginEInvoiceProviderItem } from "./plugin-e-invoice-provider-item";

export const PluginEInvoiceProviderList: FC = () => {
  const color = useColor();

  const { data, loading, error, refetch } = useQuery(GetEInvoiceProvidersDocument);

  if (loading && !data) {
    return (
      <Stack p={20}>
        <Skeleton height={200} />
      </Stack>
    );
  }

  if (error) {
    return <Errored error={error} />;
  }

  if (data && data.getEInvoiceProviders.length > 0) {
    return (
      <Container py={20} size={800}>
        <PluginEInvoiceProviderItem
          key={data.getEInvoiceProviders[0].updatedAt}
          provider={data.getEInvoiceProviders[0]}
          onRefetch={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <Container py={12}>
      <Card>
        <Stack align="center" py={20}>
          <Stack gap={8}>
            <Title ta="center" order={2} fw={300} c={color("primary")}>
              <Trans>E-Invoices</Trans>
            </Title>

            <Text ta="center">
              <Trans>
                Integrate with E-Invoices services: <strong>MatBao</strong>, ...
              </Trans>
            </Text>
          </Stack>

          <Button
            mt={10}
            type="submit"
            rightIcon={IconArrowRight}
            onClick={() => OnModalEInvoiceProvider({ mode: "create", onDone: () => refetch() })}
          >
            <Trans>Start now</Trans>
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};
