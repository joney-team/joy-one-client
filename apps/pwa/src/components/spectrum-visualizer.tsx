import { useColor } from "@/modules/theme/use-color";
import { alpha, Group, Skeleton, Text } from "@mantine/core";
import { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from "react";

export type SpectrumVisualizerStatus =
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error"
  | "none";

export interface SpectrumVisualizerProps {
  audioUrl: string;
  width?: number;
  height?: number;
  color?: string;
  maxWave?: number; // Maximum number of waveform bars to display
  onChangeStatus?: (status: SpectrumVisualizerStatus) => void;
}

export interface SpectrumVisualizerRef {
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getStatus: () => SpectrumVisualizerStatus;
}

// Generate waveform data from audio buffer
const generateWaveformData = async (audioUrl: string, numBars: number): Promise<number[]> => {
  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0); // Get first channel
    const samples = numBars;
    const blockSize = Math.floor(rawData.length / samples);
    const waveform: number[] = [];
    const peaks: number[] = [];

    // Calculate peaks for each bar
    for (let i = 0; i < samples; i++) {
      let max = 0;
      const start = i * blockSize;
      const end = Math.min(start + blockSize, rawData.length);

      for (let j = start; j < end; j++) {
        const abs = Math.abs(rawData[j] || 0);
        if (abs > max) {
          max = abs;
        }
      }
      peaks.push(max);
    }

    // Find the maximum peak to normalize against
    const maxPeak = Math.max(...peaks, 0.001); // Avoid division by zero

    // Normalize peaks to 0-1 range, with minimum height of 0.15 for visibility
    for (let i = 0; i < peaks.length; i++) {
      const normalized = peaks[i] / maxPeak;
      // Scale between 0.15 and 1.0 to ensure all bars are visible but vary in height
      const scaled = normalized * 0.85 + 0.15;
      waveform.push(scaled);
    }

    await audioContext.close();
    return waveform;
  } catch (error) {
    console.error("Failed to generate waveform:", error);
    // Return a fallback waveform with random heights
    return Array.from({ length: numBars }, () => Math.random() * 0.6 + 0.3);
  }
};

// Format time in MM:SS format
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const SpectrumVisualizer = forwardRef<SpectrumVisualizerRef, SpectrumVisualizerProps>(
  ({ audioUrl, width = 200, height = 16, color = "primary", onChangeStatus, maxWave }, ref) => {
    const colorFnc = useColor();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const waveformContainerRef = useRef<HTMLDivElement | null>(null);

    const [status, _setStatus] = useState<SpectrumVisualizerStatus>("none");
    const [waveform, setWaveform] = useState<number[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const setStatus = (status: SpectrumVisualizerStatus) => {
      _setStatus(status);
      onChangeStatus?.(status);
    };

    // Calculate number of bars - generate enough data, then limit display with maxWave
    // Use a reasonable default number of bars for generation (higher resolution)
    const numBars = maxWave ? Math.max(maxWave, 50) : 100;

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (!audioRef.current) return;

        try {
          await audioRef.current.play();
          setStatus("playing");
        } catch (error) {
          console.error("Failed to play audio:", error);
          setStatus("error");
          throw error;
        }
      },
      pause: () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setStatus("paused");
      },
      setVolume: (volume) => {
        if (audioRef.current) {
          audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
      },
      setCurrentTime: (time) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => {
        return audioRef.current ? audioRef.current.currentTime : 0;
      },
      getDuration: () => {
        return audioRef.current ? audioRef.current.duration : 0;
      },
      getStatus: () => status,
    }));

    // Generate waveform data when audio URL changes
    useEffect(() => {
      if (!audioUrl) return;

      setStatus("loading");
      generateWaveformData(audioUrl, numBars).then((data) => {
        // Limit displayed waveform bars to maxWave if specified
        if (maxWave && data.length > maxWave) {
          // Downsample the waveform data to maxWave bars by averaging values
          const step = data.length / maxWave;
          const limitedData: number[] = [];

          for (let i = 0; i < maxWave; i++) {
            const startIndex = Math.floor(i * step);
            const endIndex = Math.floor((i + 1) * step);

            // Average all values in this range
            let sum = 0;
            let count = 0;
            for (let j = startIndex; j < endIndex && j < data.length; j++) {
              sum += data[j] || 0;
              count++;
            }

            const average = count > 0 ? sum / count : 0;
            limitedData.push(average);
          }

          setWaveform(limitedData);
        } else {
          setWaveform(data);
        }
      });
    }, [audioUrl, numBars, maxWave]);

    // Setup audio element
    useEffect(() => {
      if (!audioUrl) return;

      const audio = new Audio();
      audio.src = audioUrl;
      audioRef.current = audio;
      audio.load();

      const handleLoadedData = () => {
        setDuration(audio.duration);
        setStatus("paused");
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handlePlay = () => {
        setStatus("playing");
      };

      const handlePause = () => {
        setStatus("paused");
      };

      const handleEnded = () => {
        setStatus("ended");
        setCurrentTime(0);
      };

      const handleError = () => {
        setStatus("error");
      };

      audio.addEventListener("loadeddata", handleLoadedData);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("loadeddata", handleLoadedData);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);

        // Cleanup: pause and reset audio
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      };
    }, [audioUrl]);

    // Calculate progress (0 to 1)
    const progress = duration > 0 ? currentTime / duration : 0;

    // Handle click on waveform to seek to position and play
    const handleWaveformClick = async (event: React.MouseEvent<HTMLDivElement>) => {
      if (!waveformContainerRef.current || !audioRef.current || duration === 0) return;

      const rect = waveformContainerRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const containerWidth = rect.width;
      const clickProgress = Math.max(0, Math.min(1, clickX / containerWidth));
      const newTime = clickProgress * duration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // Play audio at the new position
      try {
        await audioRef.current.play();
        setStatus("playing");
      } catch (error) {
        console.error("Failed to play audio:", error);
        setStatus("error");
      }
    };

    const timeWidth = 40;

    const waveformWidth = width - timeWidth;

    return (
      <Group ref={containerRef} gap={0} style={{ width, height }}>
        {waveform.length > 0 ? (
          <Fragment>
            <Group
              ref={waveformContainerRef}
              onClick={handleWaveformClick}
              style={{ width: waveformWidth, height }}
              className="clickable"
              gap={0}
            >
              {waveform.map((amplitude, index) => {
                const barProgress = index / waveform.length;
                const isPlayed = barProgress < progress;

                // Calculate color based on progress - darker for played, lighter for unplayed
                const barColor = isPlayed ? alpha(colorFnc(color), 1) : alpha(colorFnc(color), 0.1);

                // amplitude is normalized between 0.15 and 1.0
                // Scale to use full height range (20% to 100% of container height)
                const normalized = (amplitude - 0.15) / 0.85; // Map 0.15-1.0 to 0-1
                const barHeight = height * (0.2 + normalized * 0.8); // Map to 20%-100% of height

                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: `${barHeight}px`,
                    }}
                  >
                    <div
                      style={{
                        width: "90%",
                        height: "100%",
                        backgroundColor: barColor,
                        borderRadius: "2px",
                        transition: "background-color 0.1s ease",
                      }}
                    />
                  </div>
                );
              })}
            </Group>
            <Text
              c="gray"
              fz={10}
              ta="right"
              w={timeWidth}
              pl={5}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatTime(currentTime)}
            </Text>
          </Fragment>
        ) : (
          <Skeleton
            style={{ width: typeof width === "string" ? width : `${width}px` }}
            h={height}
          />
        )}
      </Group>
    );
  }
);
