"use client";

import { TaskView } from "./views/types";

type TaskRouteParams = {
  view: TaskView;
  slug: string;
  code: string;
};

export function parseTaskPath(pathname: string): TaskRouteParams {
  const [, , view, slug, code] = pathname.split("/");

  return {
    view:
      view && Object.values(TaskView).includes(view as TaskView)
        ? (view as TaskView)
        : TaskView.LIST,
    slug: slug ?? "d",
    code,
  };
}

export function buildTaskPath(params: TaskRouteParams): string {
  if (!params.code) return `/tasks/${params.view}/${params.slug}`;
  return `/tasks/${params.view}/${params.slug}/${params.code}`;
}

export function updateTaskPath(updates: Partial<TaskRouteParams> & { pathname?: string }): string {
  const current = parseTaskPath(updates.pathname ?? document.location.pathname);
  const next = { ...current, ...updates };

  return buildTaskPath(next);
}
