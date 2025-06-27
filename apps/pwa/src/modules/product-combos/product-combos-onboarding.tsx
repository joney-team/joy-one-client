import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { ComboIllustration } from "@/components/illustrations/combo";
import { t, tMulti } from "@/modules/lang/lang-service";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { ProductType } from "@/modules/products/products-types";
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
              {t("product_combos_desc")}
            </Title>

            <Center>
              <Button
                action
                leftIcon={IconPlus}
                onClick={() => OnProductModal({ type: ProductType.COMBO })}
              >
                {tMulti(["create"], ["combos"])}
              </Button>
            </Center>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};
