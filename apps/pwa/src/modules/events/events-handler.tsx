"use client";

import { type FC } from "react";
import { useMemberOnlineEventHandler } from "../workspace-members/hooks/use-is-member-online";

export const EventsHandler: FC = () => {
  useMemberOnlineEventHandler();
  return null;
};
