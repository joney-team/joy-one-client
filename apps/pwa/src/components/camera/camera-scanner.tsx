import { useEffect, useRef, useState } from "react";

import { ActionIcon, Box, Group } from "@mantine/core";
import { IconBolt, IconBoltOff, IconX } from "@tabler/icons-react";
import type ScannerProps from "./types/scanner-props";
import type Styleable from "./types/styleable";
import { CameraState, useCoreCamera } from "./utils/use-core-camera";
import { useDecoder } from "./utils/use-decoder";
import { Loading } from "../loading";

export function Scanner({
  onScan,
  onError,
  onClose,
  flipHorizontally = false,
  delay = 800,
  aspectRatio = "1/1",
  decoderOptions,
  className,
  style,
}: ScannerProps & Styleable) {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const decoder = useDecoder(decoderOptions);
  const cameraController = useCoreCamera({
    onError,
    defaultCameraPosition: "back",
  });
  const [_, forceUpdate] = useState(0);

  function decode() {
    if (!cameraController.preview.current) return;

    decoder
      .current(cameraController.preview.current)
      .then((code) => {
        timeoutId.current = setTimeout(decode, delay);
        if (code) onScan(code);
      })
      .catch(onError);
  }

  useEffect(() => {
    if (cameraController.cameraState != CameraState.display) return;
    decode();
  }, [cameraController.cameraState]);

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, []);

  return (
    <div className={className} style={style}>
      <div
        style={{
          aspectRatio: aspectRatio,
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <video
          ref={cameraController.preview}
          preload="none"
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: flipHorizontally ? "scaleX(1)" : "scaleX(-1)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {cameraController.cameraState === CameraState.starting && (
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Loading message="Đang khởi động máy ảnh..." />
          </Box>
        )}

        {cameraController.cameraState === CameraState.idle && (
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Loading message="Đang khởi động..." />
          </Box>
        )}

        <Box
          style={{
            position: "absolute",
            bottom: 0,
            padding: 30,
            left: 0,
            width: "100%",
            zIndex: 1,
          }}
        >
          <Group justify="space-between" align="center">
            {cameraController.capabilities.current?.torch ? (
              <ActionIcon
                size={50}
                radius={50}
                onClick={async () => {
                  await cameraController.setTorch(!cameraController.torch.current);
                  forceUpdate((s) => s + 1);
                }}
                variant="outline"
                color="white"
              >
                {cameraController.torch.current ? <IconBolt /> : <IconBoltOff />}
              </ActionIcon>
            ) : (
              <Box />
            )}

            {onClose && (
              <ActionIcon size={50} radius={50} onClick={onClose} variant="outline" color="red">
                <IconX />
              </ActionIcon>
            )}
          </Group>
        </Box>
      </div>
    </div>
  );
}
