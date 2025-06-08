import { useRouter } from "@/hooks/use-router";
import { TaskView } from "../views/types";
import { usePathname } from "next/navigation";
import { TaskEntity } from "../tasks-types";
import { TagEntity } from "@/modules/tags/tags-types";

export const getCurrentTaskView = (pathname?: string) => {
  const viewFromPathname = pathname?.split("/")[2] as TaskView;
  const view = Object.values(TaskView).includes(viewFromPathname) ? viewFromPathname : TaskView.LIST;
  return view;
};

export const useTaskRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const view = getCurrentTaskView(pathname);

  return {
    view,
    open: (task: TaskEntity) => {
      const url = `/tasks/${view}/${task.code}`;
      router.push(url, {}, { scroll: false });
    },
    openFolder: (tagFolder: TagEntity) => {
      const url = `/tasks/${view}/${tagFolder.slug}`;
      router.push(url, {}, { scroll: false });
    },
  };
};
