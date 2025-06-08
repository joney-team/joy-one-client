import { ActionIcon, Box, Group } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { IconBolt, IconBoltOff, IconCamera, IconRefresh, IconX } from "@tabler/icons-react";
import { Loading } from "../loading";
import type Styleable from "./types/styleable";
import { base64ToBlob } from "./utils/common";
import { CameraState, useCoreCamera } from "./utils/use-core-camera";

export default interface CameraProps {
  onError?: (error: any) => void;
  onTakePhoto: (file: File) => void;
  onClose?: () => void;
  flipHorizontally?: boolean;
  delay?: number;
  aspectRatio?: string;
  defaultCameraPosition?: "front" | "back";
}

export function Camera({ onTakePhoto, onError, onClose, defaultCameraPosition }: CameraProps & Styleable) {
  const cameraController = useCoreCamera({
    onError,
    defaultCameraPosition,
  });
  const forceUpdate = useForceUpdate();

  const takePhoto = async () => {
    if (!cameraController.preview.current) return;

    const canvas = document.createElement("canvas");
    const video = cameraController.preview.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");

    const contentType = "image/png";
    const blob = base64ToBlob(data, contentType);

    const file = new File([blob], "image.png", { type: contentType });
    onTakePhoto(file);
  };

  const frontCamera = cameraController.devices.find((device) => device.label.toLowerCase().includes("front"));
  const backCamera = cameraController.devices.find((device) => device.label.toLowerCase().includes("back"));

  const isAbleToSwitchCamera = frontCamera && backCamera;

  const switchCamera = async () => {
    if (!isAbleToSwitchCamera) return;
    const nextDevice = cameraController.selectedDevice === frontCamera.deviceId ? backCamera : frontCamera;
    cameraController.setSelectedDevice(nextDevice.deviceId);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{
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
            aspectRatio: 1,
            width: "100%",
            height: "100%",
            objectFit: "contain",
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
          pt={16}
          px={16}
          pb={40}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 1,
            background: "rgba(0, 0, 0, 0.8)",
          }}
        >
          <Group justify="space-between" align="center">
            <Group flex={1} justify="start" wrap="nowrap">
              <ActionIcon
                size={38}
                radius={38}
                variant="outline"
                color="white"
                disabled={!isAbleToSwitchCamera}
                onClick={switchCamera}
              >
                <IconRefresh />
              </ActionIcon>

              <ActionIcon
                size={38}
                radius={38}
                variant="outline"
                color="white"
                disabled={!cameraController.capabilities.current?.torch}
                onClick={async () => {
                  await cameraController.setTorch(!cameraController.torch.current);
                  forceUpdate();
                }}
              >
                {cameraController.torch.current ? <IconBolt /> : <IconBoltOff />}
              </ActionIcon>
            </Group>

            <Group justify="center" flex={1}>
              <ActionIcon
                size={50}
                radius={50}
                miw={100}
                onClick={takePhoto}
                disabled={cameraController.cameraState !== CameraState.display}
              >
                <IconCamera />
              </ActionIcon>
            </Group>

            <Group flex={1} justify="end">
              {onClose && (
                <ActionIcon size={38} radius={38} onClick={onClose} variant="outline" color="red">
                  <IconX />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Box>
      </div>
    </div>
  );
}
