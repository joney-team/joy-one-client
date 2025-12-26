import { useQuery } from "@apollo/client/react";
import { Group, Loader, Menu, Stack, Text } from "@mantine/core";
import { FC } from "react";

import QUERY_ACTIVITY_REACTION_USERS, {
  type ActivityReactionUsersQuery,
  type ActivityReactionUsersQueryVariables,
} from "./graphql/queryActivityReactionUsers.graphql";

export const ActivityReactionUsers: FC<{ userIds: string[] }> = ({ userIds }) => {
  const { data, loading } = useQuery<
    ActivityReactionUsersQuery,
    ActivityReactionUsersQueryVariables
  >(QUERY_ACTIVITY_REACTION_USERS, {
    variables: {
      userIds,
    },
  });

  return (
    <Menu.Dropdown>
      <Stack gap="xs" py={5}>
        {data?.users.data.map((user) => (
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
