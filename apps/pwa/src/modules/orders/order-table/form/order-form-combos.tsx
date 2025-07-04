"use client";

import { useColor } from "@/modules/theme/use-color";
import { num, t } from "@/modules/lang/lang-service";
import { Badge, Card, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconCheck, IconPackage } from "@tabler/icons-react";
import { FC, Fragment, ReactNode } from "react";
import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { useOrderTable } from "../order-table-context";

export const OrderFormCombos: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const orderForm = useOrderTable();
  const color = useColor();

  const totalLength = orderForm.combos.length + orderForm.vouchers.length;
  const activeLength =
    orderForm.combos.filter((c) => orderForm.values.combos.some((c2) => c2.id === c.id)).length +
    orderForm.vouchers.filter((v) => orderForm.values.vouchers.some((v2) => v2._id === v._id))
      .length;

  return (
    <Fragment>
      <Button
        flex={1}
        variant="outline"
        color={color(totalLength > 0 ? "primary" : "gray")}
        radius={100}
        leftIcon={IconPackage}
        rightSection={
          totalLength > 0 ? (
            <Badge size="xs" color={color("primary")} ml={-8}>
              {num(activeLength)}/{num(totalLength)}
            </Badge>
          ) : undefined
        }
        onClick={open}
        fz={13}
        fw={400}
      >
        {t("combos")}/{t("Vouchers")}
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={`${t("combos")} / ${t("Vouchers")}`} icon={IconPackage} />}
      >
        <Stack>
          {orderForm.combos.map((combo) => {
            const isActive = orderForm.values.combos.some((c) => c.id === combo.id);

            return (
              <ItemCard
                key={combo.id}
                name={combo.product.name}
                description={combo.productRefs.map((ref) => {
                  return (
                    <Group key={ref.productRefId} gap={8}>
                      <Text fz={16} c="dark" fw={400}>
                        • {ref.productRef.name}
                      </Text>

                      <Badge variant="light" color="dark">
                        {num(ref.quantity - ref.quantityUsed)}/{num(ref.quantity)}
                      </Badge>
                    </Group>
                  );
                })}
                icon={IconPackage}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    orderForm.setValues({
                      ...orderForm.values,
                      combos: orderForm.values.combos.filter((c) => c.id !== combo.id),
                    });
                  } else {
                    orderForm.setValues({
                      ...orderForm.values,
                      combos: [...orderForm.values.combos, combo],
                    });
                  }
                }}
              />
            );
          })}

          <Empty visible={totalLength === 0} />
        </Stack>
      </Modal>
    </Fragment>
  );
};

const ItemCard: FC<{
  name: string;
  description: ReactNode;
  icon: Icon;
  isActive: boolean;
  image?: string;
  onClick?: () => void;
}> = (props) => {
  const color = useColor();

  return (
    <Card
      withBorder
      shadow="none"
      className="unselectable"
      onClick={props.onClick}
      style={{
        cursor: "pointer",
        borderColor: props.isActive ? color("primary") : undefined,
      }}
      p={10}
    >
      <Group wrap="nowrap">
        <EntityImage src={props.image} w={70} h={70} onlyRead icon={props.icon} />

        <Stack flex={1} gap={8}>
          <Text fz={16} c="dark" fw={600}>
            {props.name}
          </Text>

          <Stack gap={5}>{props.description}</Stack>
        </Stack>

        {props.isActive ? (
          <ThemeIcon color={color("primary")} radius={100}>
            <IconCheck size={18} />
          </ThemeIcon>
        ) : (
          <Button radius={100} size="xs">
            {t("apply")}
          </Button>
        )}
      </Group>
    </Card>
  );
};
