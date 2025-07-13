"use client";

import { Button } from "@/components/buttons/button";
import { SessionTitle } from "@/components/session-title";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Card, Group, Stack, Textarea } from "@mantine/core";
import {
  IconCalendar,
  IconClipboard,
  IconReportAnalytics,
  IconSearch,
  IconTools,
} from "@tabler/icons-react";

import { onError } from "@/utils/exceptions.utils";
import { type FC } from "react";
import { api } from "../apis";

export const AdminTools: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <SessionTitle name="Admin Tools" icon={IconTools} />
      <Card shadow="xs">
        <Stack align="start">
          <Button onClick={() => api.post("/helpers/reset-redis")}>Reset Redis Cache</Button>

          <Button onClick={() => api.patch(`/loans/sync-all`)}>Sync All Loans</Button>

          <Button onClick={() => api.patch(`/orders/sync-all`)}>Sync All Orders</Button>

          <Button onClick={() => api.patch(`/loans/sync-customer-branch`)}>
            Sync Loan branch to Customer branch
          </Button>

          <Button
            onClick={() => Promise.all(new Array(100).fill(0).map(() => api.get(`/receipts`)))}
          >
            Test Rate Limit
          </Button>
        </Stack>
      </Card>

      <SessionTitle name="Set Runtime Webhook URL" icon={IconTools} />
      <Card shadow="xs">
        <Stack>
          <Textarea id="runtime-webhook-url" placeholder="Enter the runtime webhook URL" />
          <Group>
            <Button
              onClick={() => {
                const input = document.getElementById("runtime-webhook-url") as HTMLInputElement;
                const urls = [];

                for (const line of input.value.split("\n")) {
                  const url = line.trim();
                  if (url) urls.push(url);
                }

                return api.post(`/plugins/meta-pages/webhook/runtime`, { urls });
              }}
            >
              Set
            </Button>
          </Group>
        </Stack>
      </Card>

      <SessionTitle name="Exec Scheduling" icon={IconCalendar} />

      <Card shadow="xs">
        <Group>
          <Button
            color="cyan"
            onClick={() =>
              api.post(`/scheduling/execWorkspaceHealthCheckLoans`, {
                workspaceId: workspace.userMember.workspaceId,
              })
            }
          >
            execWorkspaceHealthCheckLoans
          </Button>

          <Button
            color="cyan"
            onClick={() =>
              api.post(`/scheduling/execSendReportToAdmin`, {
                workspaceId: workspace.userMember.workspaceId,
              })
            }
          >
            execSendReportToAdmin
          </Button>

          <Button
            color="cyan"
            onClick={() =>
              api.post(`/scheduling/execRemovePendingLoans`, {
                workspaceId: workspace.userMember.workspaceId,
              })
            }
          >
            execRemovePendingLoans
          </Button>
        </Group>
      </Card>

      <SessionTitle name="Search Index" icon={IconSearch} />
      <Card shadow="xs">
        <Group>
          <Button color="teal" onClick={() => api.patch("/search/sys/index-all")}>
            Re-Index All
          </Button>
        </Group>
      </Card>

      {/* <SessionTitle name="Migrations" icon={IconSettings2} />
      <Card shadow="xs">
        <Group>
         
        </Group>
      </Card> */}

      <SessionTitle name="Reports" icon={IconReportAnalytics} />
      <Card shadow="xs">
        <Group>
          <Button
            onClick={() => {
              api.patch(`/reports/sync-all`).catch(onError);
            }}
          >
            Sync Reports - Current Workspace
          </Button>

          <Button
            color="orange"
            onClick={() => {
              api.patch(`/reports/sync-all-workspace-reports`).catch(onError);
            }}
          >
            Sync Reports - All Workspaces
          </Button>

          <Button
            color="red"
            variant="outline"
            onClick={() => api.delete(`/reports/purge`).catch(onError)}
          >
            Purge Reports
          </Button>
        </Group>
      </Card>

      <SessionTitle name="Modal Inputs" icon={IconClipboard} />
      <Card shadow="xs">
        <Group align="start">
          {Object.values(InputModalType).map((type) => (
            <Button
              key={type}
              onClick={() =>
                OnModalInput({
                  type,
                  onDone: console.log,
                  options: [
                    { label: "Option 1", value: "option1" },
                    { label: "Option 2", value: "option2" },
                    { label: "Option 3", value: "option3" },
                  ],
                })
              }
            >
              {type}
            </Button>
          ))}
        </Group>
      </Card>

      {/* <SessionTitle name="Illustrations" icon={IconClipboard} />
      <Card shadow="xs">
        <Stack>
          <TechIllustration width={1000} />
        </Stack>
      </Card> */}
    </Stack>
  );
};
