"use client";

import { useRestQuery } from "@/modules/apis/use-rest-query";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { ResponseList } from "@/types";
import { useParams, usePathname } from "next/navigation";
import { TaskView } from "../views/types";
import { useRouter } from "@/hooks/use-router";
import { useTaskRouter } from "./use-task-router";

export const useTaskFolders = () => {
  const taskRouter = useTaskRouter();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const viewFromPathname = pathname.split("/")[2] as TaskView;
  const view = Object.values(TaskView).includes(viewFromPathname)
    ? viewFromPathname
    : TaskView.LIST;

  const tags = useRestQuery<ResponseList<TagEntity>>({
    route: "/tags",
    params: { type: TagType.TASK_FOLDER },
  });

  const tagFolder = tags.data?.data.find((v) => v.slug === params.slug);

  return {
    list: tags.data?.data ?? [],
    tagFolder,
    ...taskRouter,
    exitFolder: () => {
      const url = `/tasks/${view}`;
      router.push(url, {}, { scroll: false });
    },
  };
};
