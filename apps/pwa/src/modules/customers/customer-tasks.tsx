import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { SessionLoader } from "@/components/session-loader";
import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { getTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskEntity } from "@/modules/tasks/tasks-types";
import { useList } from "@/components/list/use-list";
import { ActionIcon, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconEye, IconLayoutNavbarCollapse, IconStack2 } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { SessionTitle } from "../../components/session-title";
import { Renderer } from "../../components/renderer";
import { BoardTaskCard } from "@/modules/tasks/views/board/board.task-card";

interface CustomerTasksProps {
  customer: CustomerEntity;
}

export const CustomerTasks: FC<CustomerTasksProps> = (props) => {
  const { customer } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [total, setTotal] = useState(0);
  const id = `customer-tasks-${customer._id}`;

  const tasks = useList<TaskEntity>({
    id: id,
    fetch: (p) =>
      getTasks({
        ...p,
        relatedCustomerId: customer._id,
        statusNotIn: isCollapsed ? [DefaultTaskStatusId.CLOSED] : undefined,
      }),
  });

  const getTotals = async () => {
    getTasks({ offset: 0, limit: 1, relatedCustomerId: customer._id })
      .then((res) => setTotal(res.count))
      .catch(() => false);
  };

  useEffect(() => {
    getTotals();
  }, []);

  useEffect(() => {
    tasks.fetch(true);
  }, [isCollapsed]);

  useEventsListener(
    [EventType.TASK_NEW, EventType.TASK_ARCHIVED],
    () => {
      tasks.fetch(true, { isSilient: true });
      getTotals();
    },
    [id]
  );

  return (
    <Stack gap={10}>
      <SessionTitle name={`Tasks`} icon={IconStack2}>
        <Renderer visible={total > 1 || (total === 1 && tasks.count === 0)}>
          <Group gap={0} onClick={() => setIsCollapsed((s) => !s)} style={{ cursor: "pointer" }}>
            <ActionIcon variant="transparent" color={isCollapsed ? "gray" : "primary"}>
              {isCollapsed ? (
                <IconEye strokeWidth={1.1} />
              ) : (
                <IconLayoutNavbarCollapse size={20} strokeWidth={1.1} />
              )}
            </ActionIcon>

            <Text fz={12} c={isCollapsed ? "gray" : "primary"} fw={400}>
              {isCollapsed ? `Xem tất cả (${total})` : "Thu gọn"}
            </Text>
          </Group>
        </Renderer>
      </SessionTitle>

      <Empty visible={tasks.isEmpty} />
      <Errored error={tasks.error} visible={tasks.isHasError} />

      <Renderer visible={tasks.isHasData}>
        <SimpleGrid cols={{ md: 3 }}>
          {tasks.data.map((task) => {
            return <BoardTaskCard key={task._id} id={task._id} />;
          })}
        </SimpleGrid>
      </Renderer>

      <SessionLoader enabled={tasks.isFetching} />
      <ButtonViewMore onClick={() => tasks.fetch()} visible={tasks.isAbleToLoadMore} />
    </Stack>
  );
};
