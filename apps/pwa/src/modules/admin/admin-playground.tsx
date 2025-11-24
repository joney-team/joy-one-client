"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { FormulaInput } from "@/components/inputs/formual-input/formula-input";
import { WorkSlotsInput } from "@/components/inputs/work-slots-input";
import { SectionTitle } from "@/components/session-title";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { CalendarView } from "@/types";
import { wait } from "@/utils/common.utils";
import { FileInput, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { useState, type FC } from "react";
import { useWorkspace } from "../workspaces/workspace-context";
import { useUploadFile } from "../files/hooks/use-upload-file";
import { onError } from "@/utils/exceptions.utils";

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

export const AdminPlayground: FC = () => {
  const workspace = useWorkspace();
  const [value, setValue] = useState("= @receiptAmount");
  const displayTime = new Date().setHours(15, 0, 0, 0);

  return (
    <Stack p={30} gap={20}>
      {workspace.userMember && <UseUploadFilePlayground />}

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
                    console.log("debug");
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
                    console.log("debug");
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
                    console.log("debug");
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

      {workspace.isAvailable && (
        <Paper withBorder p={20}>
          <Stack>
            <SectionTitle name="Work Slots Input" />
            <WorkSlotsInput
              events={[]}
              onSelectEvent={() => {}}
              onCreate={() => {}}
              onDateChange={() => {}}
              initialDate={new Date()}
              disabled={false}
              view={CalendarView.DAY}
            />
          </Stack>
        </Paper>
      )}

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
