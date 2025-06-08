import { JOYONE_COLOR } from "@/configs/colors.config";
import { useColor } from "@/modules/theme/use-color";
import { alpha } from "@mantine/core";
import { FC } from "react";

interface AppLoaderProps {
  color?: string;
  size?: number;
}

export const AppLoader: FC<AppLoaderProps> = (props) => {
  const _color = useColor();
  const color = props.color ? _color(props.color) : JOYONE_COLOR[6];
  const subColor = alpha(color, 0.5);

  const size = props.size || 50;

  return (
    <div
      className="AppLoader"
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <svg
        id="uuid-92d566c8-f1b9-4e97-ac40-9970343fc80d"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      >
        <g id="uuid-934da454-eb4b-4938-9213-d0c363ef2c0e">
          <path
            d="M400,0C179.09,0,0,179.09,0,400s179.09,400,400,400,400-179.09,400-400S620.91,0,400,0ZM400,630c-127.03,0-230-102.97-230-230s102.97-230,230-230,230,102.97,230,230-102.97,230-230,230Z"
            fill={subColor}
            strokeWidth="0"
          />
        </g>
      </svg>

      <svg
        id="uuid-82507949-cf2b-4a9e-853c-625b3ec75b72"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          animation: "animRotate 1.5s linear infinite",
        }}
      >
        <g id="uuid-a85d06c3-bffb-416b-b65d-0e7ad8dba08f">
          <circle cx="400" cy="400" r="105" fill={color} strokeWidth="0" />
          <path
            d="M715.3,483.89c-40.65-23.47-92.64-9.54-116.11,31.11-.16.27-.29.54-.44.81-39.88,68.29-113.95,114.19-198.74,114.19s-158.86-45.89-198.74-114.18c-.15-.27-.29-.55-.44-.82-23.47-40.65-75.46-54.58-116.11-31.11-40.66,23.47-54.58,75.46-31.11,116.11.17.3.36.58.54.88l-.07.04c69.29,119.05,198.27,199.08,345.94,199.08s277.3-80.43,346.46-199.97l-.05-.03c23.47-40.65,9.54-92.64-31.11-116.11Z"
            fill={color}
            strokeWidth="0"
          />
          <circle cx="400" cy="400" r="400" fill={color} opacity="0" strokeWidth="0" />
        </g>
      </svg>
    </div>
  );
};
