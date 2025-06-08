import { Empty } from "@/components/empty";
import { t } from "@/modules/lang/lang-service";
import { IconArrowDown } from "@tabler/icons-react";
import { FC } from "react";
import { useTaskDrop } from "../../tasks-dnd-provider";

export const ListTaskStatusDropper: FC<{
  tagFolderId?: string;
  status?: string;
  enabled?: boolean;
}> = (props) => {
  const droppable = useTaskDrop(`${props.tagFolderId || "root"}-${props.status || "default"}-tag-folder`, {
    tagFolderId: props.tagFolderId || "root",
    changeStatus: props.status,
  });

  if (props.enabled === false) return null;

  return (
    <Empty
      ref={droppable.setNodeRef}
      entity="tasks"
      color={droppable.isOver ? "primary.4" : undefined}
      icon={droppable.isOver ? IconArrowDown : undefined}
      message={droppable.isOver ? t("drop_entity_here", { entity: t("tasks") }) : ""}
    />
  );
};
