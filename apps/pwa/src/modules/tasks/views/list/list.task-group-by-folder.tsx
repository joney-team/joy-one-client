import { useColor } from "@/modules/theme/use-color";
import { t } from "@/modules/lang/lang-service";
import { TagEntity } from "@/modules/tags/tags-types";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { Box, Card, em, Stack, Title } from "@mantine/core";
import { FC } from "react";
import { ListTaskGroupByStatuses } from "./list.task-group-by-statuses";

interface ListTaskGroupByFolderProps {
  tagFolder?: TagEntity;
  pure?: boolean;
}

export const ListTaskGroupByFolder: FC<ListTaskGroupByFolderProps> = (props) => {
  const { tagFolder } = props;
  const name = tagFolder ? tagFolder.name : t("general_tasks");
  const color = useColor();
  const { state, statuses } = useTasks();

  const Content = () => {
    return (
      <Stack gap={16}>
        <ListTaskGroupByStatuses status={DefaultTaskStatusId.TODO} tagFolderId={tagFolder?._id} />

        {statuses
          .filter((v) => !v.isDefault)
          .map((status) => (
            <ListTaskGroupByStatuses key={status.id} status={status.id} hideWhenEmpty tagFolderId={tagFolder?._id} />
          ))}

        {state.showClosed && (
          <ListTaskGroupByStatuses status={DefaultTaskStatusId.CLOSED} tagFolderId={tagFolder?._id} showEmptyMsg />
        )}
      </Stack>
    );
  };

  if (props.pure) return <Content />;

  return (
    <Card withBorder shadow="none" style={{ position: "relative" }}>
      <Box
        w={2}
        h="100%"
        bg={tagFolder?.color || color("primary")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <Stack gap={16}>
        <Title fz={em(15)} fw={600}>
          {name}
        </Title>
        <Content />
      </Stack>
    </Card>
  );
};
