"use client";

import { Button } from "@/components/buttons/button";
import { useRestQuery } from "@/modules/apis/use-rest-query";
import { PrescriptionEntity } from "@/modules/prescriptions/prescriptions-types";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity, ResponseList } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
  const initOptions = useRestQuery<ResponseList<PrescriptionEntity>>({
    route: "/prescriptions",
    params: {
      limit: 9,
      sortLastInteractionAt: -1,
    },
  });

  return (
    <Selector
      excludeIds={props.excludeIds}
      onSearch={(q) => searchEntity<PrescriptionEntity>(AppEntity.PRESCRIPTIONS, q)}
      pinnedOptions={initOptions.data?.data.map((item) => ({ ...item, _group: t`Recently` }))}
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
            <Trans>Select</Trans>
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
