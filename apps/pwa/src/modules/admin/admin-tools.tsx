"use client";

import { Button } from "@/components/buttons/button";
import { SectionTitle } from "@/components/session-title";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Card, Divider, Group, Stack, Textarea } from "@mantine/core";
import {
  IconCalendar,
  IconClipboard,
  IconLocation,
  IconReportAnalytics,
  IconTools,
} from "@tabler/icons-react";

import { onError } from "@/utils/exceptions.utils";
import { type FC } from "react";
import { api } from "../apis";

export const AdminTools: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <SectionTitle name="System Tools" icon={IconTools} />
      <Card shadow="xs">
        <Stack align="start">
          <Button color="red" onClick={() => api.post("/helpers/reset-redis")}>
            Redis | Reset Cache
          </Button>

          <Button color="teal" onClick={() => api.patch("/search/sys/index-all")}>
            Search | Re-Index All
          </Button>
        </Stack>
      </Card>

      <SectionTitle name="Migrations" icon={IconTools} />
      <Card shadow="xs">
        <Stack align="start">
          <Button onClick={() => api.patch(`/files/move-to-external-storage`)}>
            Move files to external storage
          </Button>

          <Button onClick={() => api.patch(`/tasks/rebalance-order`)}>Rebalance Task Order</Button>

          <Button onClick={() => api.patch(`/tasks/trigger-sync-all-tasks`)}>
            Trigger Sync All Tasks
          </Button>

          <Button onClick={() => api.patch(`/files/migrate-file-refs`)}>Migrate file refs</Button>

          <Divider miw="100%" />

          <Button onClick={() => api.patch(`/loans/migrate-created-at`)}>
            Migrate Loan Created At
          </Button>

          <Button onClick={() => api.patch(`/receipts/sync-all`)}>Sync All Receipts</Button>

          <Button onClick={() => api.patch(`/loans/sync-all`)}>Sync All Loans</Button>

          <Button onClick={() => api.patch(`/orders/sync-all`)}>Sync All Orders</Button>

          <Button onClick={() => api.patch(`/loans/sync-customer-branch`)}>
            Sync Loan branch to Customer branch
          </Button>

          <Button onClick={() => api.patch(`/files/migrate`)}>Migrate files</Button>
          <Button onClick={() => api.patch(`/files/remove-old-files`)}>Remove old files</Button>
        </Stack>
      </Card>

      <SectionTitle name="VN Locations" icon={IconLocation} />
      <Card shadow="xs">
        <Stack align="start">
          <Button onClick={() => api.patch("/locations/crawls/vn-locations")}>
            Crawl VN Location
          </Button>
        </Stack>
      </Card>

      <SectionTitle name="Set Runtime Webhook URL" icon={IconTools} />
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

      <SectionTitle name="Scheduling" icon={IconCalendar} />

      <Card shadow="xs">
        <Group>
          <Button
            color="cyan"
            onClick={() =>
              api.post(`/scheduling/execFetchExternalStorageSize`, {
                workspaceId: workspace.userMember.workspaceId,
              })
            }
          >
            execFetchExternalStorageSize
          </Button>

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
              api.post(`/scheduling/execRejectPendingLoans`, {
                workspaceId: workspace.userMember.workspaceId,
              })
            }
          >
            execRejectPendingLoans
          </Button>

          <Button
            color="cyan"
            onClick={() =>
              api.post(`/scheduling/heathcheckSocialConnections`, {
                workspaceId: workspace.userMember.workspaceId,
              })
            }
          >
            heathcheckSocialConnections
          </Button>
        </Group>
      </Card>

      <SectionTitle name="Reports" icon={IconReportAnalytics} />
      <Card shadow="xs">
        <Group>
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

      <SectionTitle name="Testing" />
      <Card shadow="xs">
        <Group>
          <Button
            onClick={() => Promise.all(new Array(100).fill(0).map(() => api.get(`/receipts`)))}
          >
            Test Rate Limit
          </Button>
        </Group>
      </Card>

      <SectionTitle name="Modal Inputs" icon={IconClipboard} />
      <Card shadow="xs">
        <ModalInput>
          {(open) => (
            <Group align="start">
              {Object.values(InputModalType).map((type) => (
                <Button
                  key={type}
                  onClick={() =>
                    open({
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
          )}
        </ModalInput>
      </Card>
    </Stack>
  );
};
