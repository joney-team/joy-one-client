"use client";

import { Fragment, type FC } from "react";
import { TaskFragment } from "../graphql/fragmentTask.graphql";
import { DateTime } from "@joy-one/utils/date-time";
import { DateFormat } from "@/components/format/date-format";

export const TaskTimeline: FC<{ task: Pick<TaskFragment, "startDate" | "dueDate"> }> = ({
  task,
}) => {
  const { startDate, dueDate } = task;

  if (startDate && dueDate) {
    if (DateTime.isSame(dueDate, startDate, "day")) {
      return (
        <Fragment>
          <DateFormat value={startDate} type="time" />
          {" - "}
          <DateFormat value={dueDate} type="date-time" />
        </Fragment>
      );
    }

    return (
      <Fragment>
        <DateFormat value={startDate} type="date-time" />
        {" - "}
        <DateFormat value={dueDate} type="date-time" />
      </Fragment>
    );
  }

  if (dueDate) {
    return <DateFormat value={dueDate} type="date-time" />;
  }

  return null;
};
