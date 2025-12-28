"use client";

import { ActionIcon } from "@/components/action-icon/action-icon";
import { api } from "@/modules/apis";
import { FileEntity } from "@/modules/files/file-types";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Group, Menu, Text, ThemeIcon } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { IconMicrophone, IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { ReactNode, useEffect, useRef, useState, type FC } from "react";

interface VoiceInputProps {
  children: ReactNode;
  onComplete: (file: Pick<FileEntity, "_id" | "url">) => void;
}

function getAudioMimeType() {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus"; // Chrome, Edge
  }

  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4"; // Safari
  }

  return "";
}

export const VoiceInput: FC<VoiceInputProps> = (props) => {
  const color = useColor();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isOpened, setIsOpened] = useState(false);
  const [startAt, setStartAt] = useState<Date | null>(null);
  const forceUpdate = useForceUpdate();
  const uploadFile = useUploadFile();

  const timeTracking = startAt ? DateTime.getNowInSeconds() - DateTime.toSeconds(startAt) : 0;

  useEffect(() => {
    if (startAt) {
      const interval = setInterval(() => {
        forceUpdate();
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [startAt, forceUpdate]);

  // Cleanup: stop stream if component unmounts while recording
  useEffect(() => {
    if (isOpened) {
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }

        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      };
    }
  }, [isOpened]);

  const onStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: getAudioMimeType(),
    });

    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    streamRef.current = stream;
    setStartAt(new Date());
  };

  const onStop = async () => {
    try {
      const blob = await new Promise<Blob>((resolve) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) return;

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: getAudioMimeType(),
          });
          resolve(blob);
        };

        recorder.stop();
      });

      // Stop all tracks in the stream to release the microphone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      const formData = new FormData();
      const mimeType = getAudioMimeType();
      const fileExt =
        mimeType === "audio/webm;codecs=opus"
          ? "webm"
          : mimeType === "audio/mp4"
          ? "mp4"
          : mimeType.split("/")[1] || "webm";

      const fileName = `voice.${fileExt}`;

      formData.append("file", blob, fileName);

      const file = await api.formData(`/files/convert/audio`, formData, { responseType: "blob" });
      const fileMetadata = await uploadFile(new File([file], "voice.mp3", { type: "audio/mpeg" }));
      props.onComplete(fileMetadata);
      setIsOpened(false);
    } catch (error) {
      onError(error);
    } finally {
      setStartAt(null);
      mediaRecorderRef.current = null;
    }
  };

  return (
    <Menu shadow="xs" trigger="click" position="top" opened={isOpened} onChange={setIsOpened}>
      <Menu.Target>
        <Group justify="center" w="max-content" h="max-content">
          {props.children}
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        <Group gap={0}>
          <ThemeIcon variant="transparent">
            <IconMicrophone size={16} />
          </ThemeIcon>

          <Text w={90} ta="center" fz="sm" style={{ fontVariantNumeric: "tabular-nums" }}>
            {DateTime.toHHMMSS(timeTracking)}
          </Text>

          <ActionIcon
            color={startAt ? color("red") : color("primary")}
            onClick={startAt ? onStop : onStart}
            variant={startAt ? "filled" : "subtle"}
          >
            {startAt ? <IconPlayerPauseFilled size={12} /> : <IconPlayerPlayFilled size={12} />}
          </ActionIcon>
        </Group>
      </Menu.Dropdown>
    </Menu>
  );
};
