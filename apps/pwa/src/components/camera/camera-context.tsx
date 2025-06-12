"use client";

import { useLayout } from "@/layout/layout-context";
import { Box, Group, Text } from "@mantine/core";
import { FC, PropsWithChildren, createContext, useContext, useRef, useState } from "react";
import { Camera } from "./camera";
import { onError } from "@/utils/exceptions.utils";
import { Scanner } from "./camera-scanner";
import { zIndexes } from "@joy-one-client/config/layout";

interface ScanArgs {
  onCaputure: (data: string) => Promise<boolean | void> | void | boolean;
}

interface TakePhotoArgs {
  defaultCameraPosition?: "front" | "back";
  onCaputure: (file: File) => Promise<boolean | void> | void | boolean;
}

interface CameraContext {
  onScan: (args: ScanArgs) => void;
  onTakePhoto: (args: TakePhotoArgs) => void;
}

const scanerContext = createContext<CameraContext>({} as any);

const CameraProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [scanArgs, setScanArgs] = useState<ScanArgs | null>(null);
  const [takePhotoArgs, setTakePhotoArgs] = useState<TakePhotoArgs | null>(null);

  const isCapturing = useRef(false);
  const viewport = useLayout();

  const onClose = () => {
    setIsActive(false);
    setScanArgs(null);
    setTakePhotoArgs(null);
  };

  const _onError = (error: any) => {
    const isNotAllowed = `${error}`.includes("NotAllowedError");
    if (isNotAllowed) {
      onError("Bạn đã từ chối cấp quyền truy cập camera");
    } else {
      onError("Camera không hoạt động");
    }

    console.error(error);
    onClose();
  };

  const context: CameraContext = {
    onScan: (args) => {
      setTakePhotoArgs(null);
      setScanArgs(args);
      setIsActive(true);
    },
    onTakePhoto: (args) => {
      setScanArgs(null);
      setTakePhotoArgs(args);
      setIsActive(true);
    },
  };

  return (
    <scanerContext.Provider value={context}>
      {children}

      {isActive && !!scanArgs && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: viewport.width,
            height: viewport.height,
            zIndex: zIndexes.camera,
            background: "black",
          }}
        >
          <Scanner
            onError={onError}
            onScan={async (data) => {
              if (isCapturing.current) return;
              isCapturing.current = true;
              try {
                const isStop = await scanArgs.onCaputure(data);
                if (isStop === true) setScanArgs(null);
              } catch (error) {}
              isCapturing.current = false;
            }}
            onClose={onClose}
            aspectRatio={`${viewport.width}/${viewport.height}`}
          />
          <Box
            style={{
              position: "absolute",
              padding: 30,
              width: "100%",
              zIndex: 1,
              top: 0,
            }}
          >
            <Group justify="center" align="center">
              <Text ta="center" c="white" fw={800}>
                Quét Mã
              </Text>
            </Group>
          </Box>
        </Box>
      )}

      {isActive && !!takePhotoArgs && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: viewport.width,
            height: viewport.height,
            zIndex: 1000,
            background: "black",
          }}
        >
          <Camera
            onError={_onError}
            defaultCameraPosition={takePhotoArgs.defaultCameraPosition}
            onTakePhoto={(file) => {
              takePhotoArgs.onCaputure(file);
              onClose();
            }}
            onClose={onClose}
            aspectRatio={`${viewport.width}/${viewport.height}`}
          />
          <Box
            style={{
              position: "absolute",
              padding: 30,
              width: "100%",
              zIndex: 1,
              top: 0,
            }}
          >
            <Group justify="center" align="center">
              <Text ta="center" c="white" fw={800}>
                Chụp hình
              </Text>
            </Group>
          </Box>
        </Box>
      )}
    </scanerContext.Provider>
  );
};

export const useCamera = () => useContext(scanerContext);

export default CameraProvider;
