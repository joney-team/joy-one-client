import { useQuery } from "@apollo/client/react";
import { Group, Loader, Menu, Stack, Text } from "@mantine/core";
import { FC } from "react";
import GetActivityReactionUsersDocument from "./graphql/getActivityReactionUsers.graphql";

export const ActivityReactionUsers: FC<{ userIds: string[] }> = ({ userIds }) => {
  const { data, loading } = useQuery(GetActivityReactionUsersDocument, {
    variables: {
      userIds,
    },
  });

  return (
    <Menu.Dropdown>
      <Stack gap="xs" py={5}>
        {data?.users.results.map((user) => (
          <Group key={user._id} px="xs">
            <Text fz="xs" fw={500}>
              {user.name}
            </Text>
          </Group>
        ))}

        {loading && <Loader size="sm" type="dots" />}
      </Stack>
    </Menu.Dropdown>
  );
};
