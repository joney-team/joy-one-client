import { t } from "@/modules/lang/lang-service";
import { Group, Text } from "@mantine/core";
import { FC } from "react";

export const ListTaskRowHead: FC = () => {
  return (
    <Group justify="space-between" gap={5}>
      <Text flex={1} px={10} fz={13} fw={500} c="gray">
        {t("name")}
      </Text>

      <Text px={10} w={150} ta="left" fz={13} fw={500} c="gray">
        {t("assignee")}
      </Text>
      <Text px={10} w={200} ta="left" fz={13} fw={500} c="gray">
        {t("customer")}
      </Text>
      <Text px={10} w={150} ta="left" fz={13} fw={500} c="gray">
        {t("due_date")}
      </Text>
      <Text px={10} w={70} ta="left" fz={13} fw={500} c="gray">
        {t("priority")}
      </Text>
    </Group>
  );
};
