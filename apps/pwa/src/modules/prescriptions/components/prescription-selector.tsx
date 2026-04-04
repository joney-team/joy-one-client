"use client";

import { Button } from "@/components/buttons/button";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Combobox, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { Selector, SelectorContext } from "../../../components/selector";
import { PrescriptionFragment } from "../graphql/fragmentPrescription.graphql";
import GetPrescriptionsDocument from "../graphql/getPrescriptions.graphql";

interface PrescriptionSelectorProps {
  excludeIds?: string[];
  onSelect: (value: PrescriptionFragment) => void;
  target?: (ctx: SelectorContext<PrescriptionFragment>) => ReactNode;
}

export const PrescriptionSelector: FC<PrescriptionSelectorProps> = (props) => {
  const { data: prescriptionsData } = useQuery(GetPrescriptionsDocument, {
    variables: {
      limit: 9,
      query: {
        sortLastInteractionAt: -1,
      },
    },
  });

  return (
    <Selector
      excludeIds={props.excludeIds}
      onSearch={(q) => searchEntity<PrescriptionFragment>(AppEntity.PRESCRIPTIONS, q)}
      pinnedOptions={prescriptionsData?.list.results.map((item) => ({
        ...item,
        _group: t`Recently`,
      }))}
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
