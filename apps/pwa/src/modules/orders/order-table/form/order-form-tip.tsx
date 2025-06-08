import { num, t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group, Skeleton, Text } from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "@/components/buttons/button";
import { useOrderTable } from "../order-table-context";

export const OrderFormTip: FC = () => {
  const workspace = useWorkspace();
  const orderForm = useOrderTable();

  if (!workspace.settings.allowTip) return null;

  return (
    <Group justify="space-between" onClick={orderForm.onTip} style={{ cursor: "pointer" }}>
      <Group gap={5}>
        <Text>{t("TIP")}</Text>

        <Button leftIcon={orderForm.tipAmount > 0 ? IconPencil : IconPlus} size="compact-xs" variant="subtle">
          {t(orderForm.tipAmount > 0 ? "edit" : "add")}
        </Button>
      </Group>

      <Group gap={8}>
        {orderForm.isCalculating ? (
          <Skeleton h={20} w={80} visible={orderForm.isCalculating} />
        ) : (
          <Text>{num(orderForm.tipAmount, { type: "money" })}</Text>
        )}
      </Group>
    </Group>
  );
};
