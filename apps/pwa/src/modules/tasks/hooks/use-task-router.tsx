"use client";

import { TagFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import { usePathname, useRouter } from "next/navigation";
import { TaskFragment } from "../graphql/fragmentTask.graphql";
import { TaskView } from "../views/types";

export const getCurrentTaskView = (pathname?: string) => {
  const viewFromPathname = pathname?.split("/")[2] as TaskView;
  const view = Object.values(TaskView).includes(viewFromPathname)
    ? viewFromPathname
    : TaskView.LIST;
  return view;
};

export const useTaskRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const view = getCurrentTaskView(pathname);

  return {
    view,
    open: (task: Pick<TaskFragment, "code">) => {
      const url = `/tasks/${view}/${task.code}`;
      router.push(url, { scroll: false });
    },
    openFolder: (tagFolder: TagFragment) => {
      const url = `/tasks/${view}/${tagFolder.slug}`;
      router.push(url, { scroll: false });
    },
  };
};
