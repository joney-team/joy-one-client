"use client";

import TasksProvider from "@/modules/tasks/tasks-provider";
import TasksViews from "@/modules/tasks/views/task-views";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <TasksViews />
      {children}
    </TasksProvider>
  );
}
