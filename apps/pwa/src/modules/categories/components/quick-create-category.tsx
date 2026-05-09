"use client";

import { CategoryType } from "@/graphql/enums.graphql";
import { graphqlClient } from "@/graphql/graphql-client";
import { onActionLoad } from "@/utils/actions";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, Popover, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren, useState } from "react";
import CreateCategoryDocument from "../graphql/createCategory.graphql";
import { CategoryFragment } from "../graphql/fragmentCategory.graphql";

interface QuickCreateCategoryProps {
  type?: CategoryType;
  onCreated?: (category: CategoryFragment) => void;
}

export const QuickCreateCategory: FC<PropsWithChildren<QuickCreateCategoryProps>> = (props) => {
  const { t } = useLingui();
  const [opened, setOpened] = useState(false);

  const children = props.children ? (
    <Group onClick={() => setOpened((s) => !s)}>{props.children}</Group>
  ) : (
    <ActionIcon onClick={() => setOpened((s) => !s)}>
      <IconPlus size={16} strokeWidth={1.5} />
    </ActionIcon>
  );

  const entity = t`Category`;
  const label = t`Create ${entity}`;

  return (
    <Popover shadow="md" opened={opened} onChange={setOpened}>
      <Popover.Target>{children}</Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          label={label}
          placeholder={t`Enter ${entity.toLowerCase()} name`}
          autoFocus
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const value = (e.target as any).value;
              onActionLoad({
                name: <Trans>Create {entity}</Trans>,
                process: async () => {
                  const category = await graphqlClient.mutate({
                    mutation: CreateCategoryDocument,
                    variables: {
                      input: {
                        name: value,
                        type: props.type,
                      },
                    },
                  });
                  if (category.data?.category) {
                    props.onCreated?.(category.data?.category);
                  }
                },
              });
              setOpened(false);
            }
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
