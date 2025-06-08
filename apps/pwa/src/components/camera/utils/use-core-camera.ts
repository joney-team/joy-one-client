import { useEffect, useRef, useState } from "react"
import { eventOn, videoReady, timeout } from "./common"
import shimGetUserMedia from "./shim-get-user-media"

interface HTMLVideoElementExtended extends HTMLVideoElement {
  mozSrcObject?: MediaStream
}

interface MediaTrackCapabilities {
  aspectRatio?: DoubleRange;
  autoGainControl?: boolean[];
  channelCount?: ULongRange;
  deviceId?: string;
  displaySurface?: string;
  echoCancellation?: boolean[];
  facingMode?: string[];
  frameRate?: DoubleRange;
  groupId?: string;
  height?: ULongRange;
  noiseSuppression?: boolean[];
  sampleRate?: ULongRange;
  sampleSize?: ULongRange;
  width?: ULongRange;
  torch?: boolean;
}

interface MediaTrackConstraintSet {
  aspectRatio?: ConstrainDouble;
  autoGainControl?: ConstrainBoolean;
  channelCount?: ConstrainULong;
  deviceId?: ConstrainDOMString;
  displaySurface?: ConstrainDOMString;
  echoCancellation?: ConstrainBoolean;
  facingMode?: ConstrainDOMString;
  frameRate?: ConstrainDouble;
  groupId?: ConstrainDOMString;
  height?: ConstrainULong;
  noiseSuppression?: ConstrainBoolean;
  sampleRate?: ConstrainULong;
  sampleSize?: ConstrainULong;
  width?: ConstrainULong;
  torch?: ConstrainBoolean;
}

export enum CameraState {
  starting, display, stopping, idle,
}

const handleStream = async (
  preview: HTMLVideoElementExtended,
  stream: MediaStream,
  info: MediaDeviceInfo
) => {
  if (preview.srcObject !== undefined) {
    preview.srcObject = stream
  } else if (preview.mozSrcObject !== undefined) {
    preview.mozSrcObject = stream
  } else if (window.URL.createObjectURL) {
    preview.src = window.URL.createObjectURL(stream as any)
  } else if (window.webkitURL) {
    preview.src = window.webkitURL.createObjectURL(stream as any)
  } else {
    preview.src = stream as any
  }

  await eventOn(preview, 'canplay')

  const isFrontCamera = /front|user|face/gi.test(info.label)
  preview.style.transform = isFrontCamera ? 'scaleX(-1)' : ''

  await preview.play()
  await videoReady(preview, 750)

  await timeout(500)
  const [track] = stream.getVideoTracks()
  return track?.getCapabilities?.() ?? {}
}

const releaseStream = async (
  preview: HTMLVideoElementExtended | null,
  stream: MediaStream | null,
  torch: boolean,
  onError: ((error: any) => void) | undefined,
) => {
  if (preview) {
    preview.src = ''
    preview.srcObject = null
    preview.load()

    await eventOn(preview, 'error')
  }
  if (stream) {
    const constrains: MediaTrackConstraints | null = torch
      ? { advanced: [{ torch: false } as MediaTrackConstraintSet] }
      : null
    for (const track of stream.getVideoTracks()) {
      if (constrains) await track.applyConstraints(constrains).then(onError)
      stream.removeTrack(track)
      track.stop()
    }
  }
}

const requestCameraPermission = () => navigator.mediaDevices
  .getUserMedia({ audio: false, video: true })
  .then(s => s.getTracks().forEach(i => i.stop()))

const getDevices = () => shimGetUserMedia()
  .then(requestCameraPermission)
  .then(_ => navigator.mediaDevices.enumerateDevices())
  .then(ds => ds.filter((d) => d.kind === 'videoinput'))

const getUserMedia = (deviceId: string) => navigator.mediaDevices
  .getUserMedia({ audio: false, video: { deviceId } })

export const useCoreCamera = (args?: {
  onError?: ((error: any) => void) | undefined,
  defaultCameraPosition?: 'front' | 'back' | undefined,
}) => {
  const preview = useRef<HTMLVideoElementExtended>(null)
  const stream = useRef<MediaStream | null>(null)
  const isMounted = useRef<boolean>(false)
  const capabilities = useRef<MediaTrackCapabilities | null>(null)
  const torch = useRef<boolean>(false)

  const [cameraState, setCameraState] = useState<CameraState>(CameraState.idle)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();

  const onError = (e: any) => {
    args?.onError?.(e)
  }

  const release = async () => {
    setCameraState(CameraState.stopping)
    await releaseStream(preview.current, stream.current, torch.current, onError);
    setCameraState(CameraState.idle)
  }

  const setTorch = async (target: boolean) => {
    if (!stream.current || !capabilities.current?.torch || target == torch.current) return

    const [track] = stream.current.getVideoTracks()
    await track.applyConstraints({ advanced: [{ torch: target } as MediaTrackConstraintSet] })
    torch.current = target;
  }

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
      release()
    }
  }, [])

  useEffect(() => {
    setCameraState(CameraState.starting)
    getDevices()
      .then(ds => {
        setDevices(ds)
        const backCamera = ds.find(i => /back|environment/gi.test(i.label));
        const frontCamera = ds.find(i => /front|user|face/gi.test(i.label));
        const deviceId = (args?.defaultCameraPosition === 'front' ? frontCamera?.deviceId : backCamera?.deviceId) || ds[0].deviceId
        setSelectedDevice(deviceId)
      })
      .catch(onError)

    return () => {
      release()
    }
  }, [preview])

  useEffect(() => {
    if (selectedDevice == undefined) return

    const selectedDeviceIndex = devices.findIndex(i => i.deviceId == selectedDevice)
    if (selectedDeviceIndex < 0) return

    const selected = devices[selectedDeviceIndex]

    release()
      .then(_ => getUserMedia(selected.deviceId))
      .then(async s => {
        if (!preview.current) return
        stream.current = s

        if (isMounted) {
          await handleStream(preview.current, s, selected)
            .then(c => {
              capabilities.current = c
              setCameraState(CameraState.display)
            })
        } else {
          release()
        }
      })
      .catch(onError)

    return () => {
      release()
    }
  }, [selectedDevice])

  return {
    capabilities,
    cameraState,
    preview,

    devices,
    selectedDevice,
    setSelectedDevice,

    torch,
    setTorch,
  }
}
