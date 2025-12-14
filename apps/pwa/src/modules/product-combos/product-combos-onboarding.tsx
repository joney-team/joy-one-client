"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { ComboIllustration } from "@/components/illustrations/combo";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductType } from "@/modules/products/products-types";
import { Trans } from "@lingui/react/macro";
import { Card, Center, Stack, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";

export const ProductCombosOnboarding: FC = () => {
  return (
    <Container>
      <Stack p={16 * 2}>
        <Card shadow="xs" p={16 * 2}>
          <Stack gap={30}>
            <Center>
              <ComboIllustration width={250} />
            </Center>

            <Title order={4} ta="center" fw={400} fz={18}>
              <Trans>
                A combo is a shopping method that combines multiple products into a single package
                to stimulate consumption and increase order value
              </Trans>
            </Title>

            <Center>
              <Button
                leftIcon={IconPlus}
                onClick={() => OnProductModal({ type: ProductType.COMBO })}
              >
                <Trans>Create combos</Trans>
              </Button>
            </Center>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};
