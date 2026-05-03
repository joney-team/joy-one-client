"use client";

import { renderPage } from "@/layout/layout-page";

export default renderPage(() =>
  import("@/modules/plugins/ai-assistants/plugin-ai-assistant-list").then(
    (mod) => mod.AiAssistantList
  )
);
