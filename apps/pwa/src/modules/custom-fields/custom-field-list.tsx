"use client";

import { List } from "@/components/list";
import { enumColumn } from "@/components/list/columns/enum-column";
import { appEntities } from "@/constant";
import { Badge, Group, Stack } from "@mantine/core";
import { IconEdit, IconForms } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { customFieldTypes } from "./custom-field-constants";
import { CustomFieldEntity, CustomFieldType } from "./custom-field-types";
import { OnModalCustomField } from "./modals/modal-custom-field";
import { Trans } from "@lingui/react/macro";

export const CustomFieldList: FC = () => {
  return (
    <Stack p={16}>
      <List<CustomFieldEntity>
        id="custom-fields"
        name={<Trans>Custom fields</Trans>}
        icon={IconForms}
        route="/custom-fields"
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
                      {appEntities[entity].name()}
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
          EventType.CUSTOM_FIELDS_NEW,
          EventType.CUSTOM_FIELDS_UPDATED,
          EventType.CUSTOM_FIELDS_REMOVED,
        ]}
        creatable={{
          onCreate: () => OnModalCustomField(),
        }}
      />
    </Stack>
  );
};
