import { FC, RefObject } from "react";

export type GanttTaskTimelineComponent = FC<{ timelineRef: RefObject<HTMLDivElement | null> }>;
