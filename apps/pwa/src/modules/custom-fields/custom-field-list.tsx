"use client";

import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { appEntities } from "@/constant";
import { EventType } from "@/graphql/enums.graphql";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Group, Stack } from "@mantine/core";
import { IconEdit, IconForms } from "@tabler/icons-react";
import { type FC } from "react";
import { customFieldTypes } from "./custom-field-constants";
import { CustomFieldEntity, CustomFieldType } from "./custom-field-types";
import { OnModalCustomField } from "./modals/modal-custom-field";

import QUERY_CUSTOM_FIELDS from "./graphql/queryCustomFields.graphql";

export const CustomFieldList: FC = () => {
  const { t } = useLingui();

  return (
    <Stack p={16}>
      <List<CustomFieldEntity>
        id="custom-fields"
        name={<Trans>Custom fields</Trans>}
        icon={IconForms}
        query={QUERY_CUSTOM_FIELDS}
        columns={{
          label: { name: <Trans>Name</Trans> },
          description: { name: <Trans>Description</Trans> },
          key: { name: <Trans>Key</Trans>, filter: { text: true } },
          type: enumColumn({
            name: <Trans>Type</Trans>,
            options: Object.values(CustomFieldType).map((type) => ({
              label: customFieldTypes[type].label(),
              value: type,
            })),
          }),
          entities: {
            name: <Trans>Apply</Trans>,
            render: ({ value }) => {
              return (
                <Group>
                  {value?.map((entity) => (
                    <Badge variant="light" key={entity} color="gray">
                      {t(appEntities[entity].name)}
                    </Badge>
                  ))}
                </Group>
              );
            },
          },
        }}
        actions={[
          {
            label: <Trans>Edit</Trans>,
            icon: IconEdit,
            onClick: (data) => {
              OnModalCustomField({ customField: data });
            },
          },
        ]}
        events={[
          EventType.CustomFieldsNew,
          EventType.CustomFieldsUpdated,
          EventType.CustomFieldsRemoved,
        ]}
        creatable={{
          onCreate: () => OnModalCustomField(),
        }}
      />
    </Stack>
  );
};
