import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { useQuery } from "@/modules/apis/use-query";
import { num, t } from "@/modules/lang/lang-service";
import { PromotionEntity } from "@/modules/promotions/promotions-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ResponseList } from "@/types";
import { Badge, Card, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconCheck } from "@tabler/icons-react";
import { FC, Fragment, ReactNode } from "react";
import { useOrderTable } from "../order-table-context";
import { promotionDescription } from "@/modules/promotions/promotions-service";

export const OrderFormPromotions: FC = () => {
  const workspace = useWorkspace();
  const mod = workspace.getModule("promotions");
  const orderTable = useOrderTable();
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();

  const promotions = useQuery<ResponseList<PromotionEntity>>({
    isSkip: !orderTable.values.relatedCustomer,
    queryKey: [orderTable.version.toString()],
    route: `/promotions/customers/${orderTable.values.relatedCustomer?._id}`,
  });

  const allPromotions = [
    ...orderTable.values.promotions,
    ...(promotions.data?.data ?? []).filter(
      (p) => !orderTable.values.promotions.some((c) => c.id === p.id)
    ),
  ];

  const isHasPromotions = orderTable.values.relatedCustomer && allPromotions.length > 0;
  const selectedPromotions = allPromotions.filter((p) =>
    orderTable.values.promotions.some((c) => c.id === p.id)
  );

  return (
    <Fragment>
      <Button
        variant="outline"
        color={isHasPromotions ? "primary" : "gray"}
        flex={1}
        radius={100}
        leftIcon={mod.icon}
        fz={13}
        fw={400}
        onClick={open}
        rightSection={
          allPromotions.length > 0 ? (
            <Badge size="xs" color={color("primary")} ml={-8}>
              {num(selectedPromotions.length)}/
              {num(Math.max(allPromotions.length, selectedPromotions.length))}
            </Badge>
          ) : undefined
        }
      >
        {t("promotions")}
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={`${t("promotions")}`} icon={mod.icon} />}
        zIndex={500}
      >
        <Stack>
          {allPromotions.map((promotion) => {
            const isActive = orderTable.values.promotions?.some((c) => c.id === promotion.id);

            return (
              <PromotionCard
                key={promotion.id}
                name={promotion.name}
                description={promotionDescription(promotion)}
                icon={mod.icon}
                isActive={isActive}
                onClick={() => {
                  if (isActive) {
                    orderTable.setValues({
                      ...orderTable.values,
                      promotions: orderTable.values.promotions.filter((c) => c.id !== promotion.id),
                    });
                  } else {
                    orderTable.setValues({
                      ...orderTable.values,
                      promotions: [...orderTable.values.promotions, promotion],
                    });
                  }
                }}
              />
            );
          })}

          <Empty visible={allPromotions.length === 0} />
        </Stack>
      </Modal>
    </Fragment>
  );
};

const PromotionCard: FC<{
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
