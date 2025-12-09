"use client";

import { Fragment, type FC } from "react";
import { TaskDataFragment } from "../graphql/fragmentTask.graphql";
import { DateTime } from "@joy-one-client/utils/date-time";
import { DateFormat } from "@/components/format/date-format";

export const TaskTimeline: FC<{ task: Pick<TaskDataFragment, "startDate" | "dueDate"> }> = ({
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
