"use client";

import { AppEntity } from "@/types";
import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { getPrescriptions } from "@/modules/prescriptions/prescriptions-service";
import { PrescriptionEntity } from "@/modules/prescriptions/prescriptions-types";
import { searchEntity } from "@/modules/search/search-service";
import { Combobox, em, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";

interface PrescriptionSelectorProps {
  excludeIds?: string[];
  onSelect: (value: PrescriptionEntity) => void;
  target?: (ctx: SelectorContext<PrescriptionEntity>) => ReactNode;
}

export const PrescriptionSelector: FC<PrescriptionSelectorProps> = (props) => {
  return (
    <Selector
      excludeIds={props.excludeIds}
      onSearch={(q) => searchEntity<PrescriptionEntity>(AppEntity.PRESCRIPTIONS, q)}
      onInitOptions={() => getPrescriptions({ limit: 5 }).then((res) => res.data)}
      searchPlaceholder={`${t("search_with", {
        query: ["name"].map((v) => t(v).toLowerCase()).join(", "),
      })}`}
      renderOption={(prescription) => {
        return (
          <Combobox.Option value={prescription._id} key={prescription._id}>
            <Group gap={10}>
              <Text>{prescription.name}</Text>
            </Group>
          </Combobox.Option>
        );
      }}
      target={(ctx) => {
        const { toggle } = ctx;
        if (props.target) return props.target(ctx);
        return (
          <Button
            tt="capitalize"
            size="xs"
            variant="light"
            radius={100}
            leftIcon={IconPlus}
            fz={em(14)}
            fw={500}
            onClick={toggle}
          >
            {t("select")}
          </Button>
        );
      }}
      onSelect={(e) => {
        if (!e) return;
        props.onSelect(e);
      }}
    />
  );
};
