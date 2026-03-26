"use client";

import { Button } from "@/components/buttons/button";
import { CircularProgress } from "@/components/circular-progress/circular-progress";
import { DateFormat } from "@/components/format/date-format";
import { FormulaInput } from "@/components/inputs/formual-input/formula-input";
import { SectionTitle } from "@/components/session-title";
import { TimeSlots } from "@/components/time-slots/time-slots";
import { TimeEvent } from "@/components/time-slots/time-slots.types";
import QUERY_APP_CONFIG from "@/configs/queryAppConfig.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import QUERY_AUTH_USER from "@/modules/auth/graphql/queryAuthUser.graphql";
import { wait } from "@/utils/common.utils";
import { onError } from "@/utils/exceptions.utils";
import { renderWeekdayFromISO } from "@joy-one-client/utils/date-time-render";
import { FileInput, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useRef, useState, type FC } from "react";
import { graphqlClient } from "../../graphql/graphql-client";
import { useUploadFile } from "../files/hooks/use-upload-file";
import { useLang } from "../lang/lang-context";
import { useWorkspace } from "../workspaces/workspace-context";
import QUERY_TEST_ERROR_NOT_FOUND from "./graphql/queryTestErrorNotFound.graphql";
import { ModalFiles, ModalFilesRef } from "../files/modals/modal-files";

const GraphQLPlayground: FC = () => {
  return (
    <Group>
      <Button
        onClick={() =>
          graphqlClient
            .query({
              query: QUERY_APP_CONFIG,
            })
            .then((result) => {
              console.log("result", result.data?.appConfig);
            })
        }
      >
        Get config
      </Button>

      <Button
        onClick={() =>
          graphqlClient
            .query({
              query: QUERY_AUTH_USER,
              fetchPolicy: "network-only",
            })
            .then((result) => {
              console.log("result", result.data?.authUser);
            })
        }
      >
        Get with auth
      </Button>

      <Button
        onClick={() =>
          graphqlClient.query({
            query: QUERY_TEST_ERROR_NOT_FOUND,
            fetchPolicy: "network-only",
          })
        }
      >
        Test error not found
      </Button>
    </Group>
  );
};

const UseUploadFilePlayground: FC = () => {
  const uploadFile = useUploadFile();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const fileMetadata = await uploadFile(file);
      console.log("fileMetadata", fileMetadata);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p={20}>
      <Stack>
        <SectionTitle name="Use Upload File" />

        <FileInput value={file} onChange={setFile} accept="image/*" />

        <Group>
          <Button onClick={onUpload} loading={loading}>
            Upload
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

const TimeSlotsPlayground: FC = () => {
  const { locale } = useLang();
  const [events, setEvents] = useState<TimeEvent[]>([
    {
      id: "1",
      start: "07:10",
      end: "10:00",
      columnIndex: 2,
    },
  ]);

  const cols = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7].map((dayWeek) => {
      return {
        dayWeek,
        head: (
          <Stack>
            <Text fz={12} fw={600} tt="capitalize" p="xs">
              {renderWeekdayFromISO(dayWeek, locale)}
            </Text>
          </Stack>
        ),
      };
    });
  }, [locale]);

  return (
    <TimeSlots
      cols={cols}
      events={events}
      availableTimeIntervals={[
        { start: "2:00", end: "24:00", columnIndex: 2 },
        { start: "7:38", end: "16:00", columnIndex: 1 },
      ]}
      onSelect={(value) => {
        setEvents((s) => [...s, { id: Date.now().toString(), ...value, title: "Event" }]);
      }}
      onEventClick={(event, element) => console.log("onEventClick", event, element)}
      onEventResize={(event) => setEvents((s) => s.map((v) => (v.id === event.id ? event : v)))}
    />
  );
};

export const AdminPlayground: FC = () => {
  const workspace = useWorkspace();
  const [value, setValue] = useState("= @receiptAmount");
  const displayTime = new Date().setHours(15, 0, 0, 0);
  const modalFiles = useRef<ModalFilesRef | null>(null);

  return (
    <Stack p="md" gap="md">
      <Paper withBorder>
        <Stack p="md">
          <SectionTitle name="GraphQL Playground" />
          <GraphQLPlayground />

          <Button
            onClick={() =>
              modalFiles.current?.open({ onSelectedFiles: (files) => console.log("files", files) })
            }
          >
            Open Modal Files
          </Button>

          <ModalFiles ref={modalFiles} />
        </Stack>
      </Paper>

      <Paper withBorder>
        <Stack>
          <Group px={20} pt={20}>
            <SectionTitle name="Time Slots" />
          </Group>
          <TimeSlotsPlayground />
        </Stack>
      </Paper>

      <Paper withBorder p={20}>
        <Stack>
          <SectionTitle name="Circular Progress" />
          <Group>
            <CircularProgress progress={0} borderType="dashed" />
            <CircularProgress progress={0.25} />
            <CircularProgress progress={0.5} />
            <CircularProgress progress={0.75} />
            <CircularProgress progress={1} />
          </Group>

          <SectionTitle name="Buttons" />
          <Group>
            <Button size="xs" leftIcon={IconPlus}>
              xs
            </Button>
            <Button size="sm" leftIcon={IconPlus}>
              sm
            </Button>
            <Button size="md" leftIcon={IconPlus}>
              md
            </Button>
            <Button size="lg" leftIcon={IconPlus}>
              lg
            </Button>
          </Group>
          <Group>
            <Button size="compact-xs" leftIcon={IconPlus}>
              compact-xs
            </Button>
            <Button size="compact-sm" leftIcon={IconPlus}>
              compact-sm
            </Button>
            <Button size="compact-md" leftIcon={IconPlus}>
              compact-md
            </Button>
            <Button size="compact-lg" leftIcon={IconPlus}>
              compact-lg
            </Button>
          </Group>
        </Stack>
      </Paper>

      {workspace.member && <UseUploadFilePlayground />}

      <Paper withBorder p={20}>
        <Stack>
          <SectionTitle name="Confirm modal" />
          <Group>
            <Button
              color="orange"
              onClick={() =>
                onConfirmModal({
                  content: (
                    <Text>
                      This action is so important that you are required to confirm it with a modal.
                      Please click one of these buttons to proceed.
                    </Text>
                  ),
                  onConfirm: async () => {
                    await wait(2000);
                  },
                })
              }
            >
              Warning
            </Button>

            <Button
              color="red"
              onClick={() =>
                onConfirmModal({
                  type: "danger",
                  content: (
                    <Text>
                      This action is so important that you are required to confirm it with a modal.
                      Please click one of these buttons to proceed.
                    </Text>
                  ),
                  onConfirm: async () => {
                    await wait(2000);
                  },
                })
              }
            >
              Danger
            </Button>

            <Button
              color="red"
              onClick={() =>
                onConfirmModal({
                  type: "danger",
                  content: (
                    <Text>
                      This action is so important that you are required to confirm it with a modal.
                      Please click one of these buttons to proceed.
                    </Text>
                  ),
                  onConfirm: async () => {
                    await wait(2000);
                  },
                  inverse: true,
                })
              }
            >
              Inverse
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p={20}>
        <Stack>
          <SectionTitle name="Date Format" />
          <Group>
            <Text fw={400}>Date Time:</Text>
            <DateFormat value={displayTime} type="date-time" />
          </Group>

          <Group>
            <Text fw={400}>Date Time (12 hour):</Text>
            <DateFormat value={displayTime} type="date-time" hour12 />
          </Group>

          <Group>
            <Text fw={400}>Date:</Text>
            <DateFormat value={displayTime} type="date" />
          </Group>

          <Group>
            <Text fw={400}>Time:</Text>
            <DateFormat value={displayTime} type="time" />
          </Group>

          <Group>
            <Text fw={400}>Time (12 hour):</Text>
            <DateFormat value={displayTime} type="time" hour12 />
          </Group>

          <Group align="start">
            <Text fw={400}>Custom format:</Text>

            <Stack>
              <Text>
                <DateFormat value={displayTime} type="custom" format={{ timeStyle: "short" }} />
              </Text>
              <Text>
                <DateFormat value={displayTime} type="custom" format={{ timeStyle: "long" }} />
              </Text>
              <Text>
                <DateFormat
                  value={displayTime}
                  type="custom"
                  format={{ dateStyle: "long", timeStyle: "long" }}
                />
              </Text>
            </Stack>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p={20}>
        <Stack>
          <SectionTitle name="Formula Input" />
          <FormulaInput
            value={value}
            onChange={setValue}
            variables={[
              { name: "revenue", description: "Total revenue amount", isNumerical: true },
              { name: "cost", description: "Total cost amount", isNumerical: true },
              { name: "profit", description: "Total profit amount", isNumerical: true },
              { name: "customerName", description: "Name of customer" },
              { name: "email", description: "Customer email address" },
              { name: "receiptAmount", description: "Amount of receipt", isNumerical: true },
            ]}
          />

          <Paper p={16} withBorder>
            <Text size="sm" fw={600} mb={8}>
              Output String Value:
            </Text>
            {/* <Code block>{value || "(empty)"}</Code> */}
            <TextInput value={value} readOnly />
          </Paper>

          <Paper p={16} withBorder>
            <Text size="sm" fw={600} mb={8}>
              Tips:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Type @ to see variable suggestions</li>
              <li>Start with = for formula mode (only numerical variables)</li>
              <li>Switching to formula mode (=) clears all content</li>
              <li>Cannot type = inside formula mode (clear all first)</li>
              <li>Variables are highlighted and @ symbol is hidden</li>
              <li>Hover over variables to see their descriptions (tooltip)</li>
              <li>Backspace/Delete removes entire variable</li>
              <li>Use ↑↓ arrow keys to navigate dropdown (auto-scroll)</li>
              <li>Copy/Cut converts selection to @variable format</li>
            </ul>
          </Paper>
        </Stack>
      </Paper>
    </Stack>
  );
};
