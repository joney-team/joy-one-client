import { useColor } from "@/modules/theme/use-color";
import type { FC, SVGProps } from "react";

export const BoxIllustration: FC<SVGProps<SVGSVGElement>> = (props) => {
  const color = useColor();
  const primaryColor = color(`${props.color || "dark"}.2`);
  const secondaryColor = color(`${props.color || "dark"}.0`);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 102 69.89"
      style={{
        maxWidth: "100%",
        ...props.style,
      }}
    >
      <defs>
        <linearGradient
          id="b"
          x1="49.91"
          x2="50.35"
          y1="4.15"
          y2="70.7"
          gradientTransform="matrix(1 0 0 -1 0 58.95)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff"></stop>
          <stop offset="1" stopColor="#f2f1fe"></stop>
        </linearGradient>
        <linearGradient
          id="c"
          x1="50.01"
          x2="50.01"
          y1="58.95"
          y2="2.95"
          gradientTransform="matrix(1 0 0 -1 0 58.95)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={secondaryColor}></stop>
          <stop offset="1" stopColor={primaryColor}></stop>
        </linearGradient>
        <linearGradient
          id="d"
          x1="50.01"
          x2="50.01"
          y1="20.95"
          y2="47.95"
          gradientTransform="matrix(1 0 0 -1 0 58.95)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={secondaryColor}></stop>
          <stop offset="1" stopColor={primaryColor}></stop>
        </linearGradient>
        <radialGradient
          id="a"
          cx="50.88"
          cy="57.51"
          r="51.15"
          fx="50.88"
          fy="57.51"
          gradientTransform="matrix(1 0 0 .2 0 46.81)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={secondaryColor}></stop>
          <stop offset="0.09" stopColor={primaryColor} stopOpacity="0.96"></stop>
          <stop offset="0.24" stopColor={primaryColor} stopOpacity="0.84"></stop>
          <stop offset="0.44" stopColor={primaryColor} stopOpacity="0.65"></stop>
          <stop offset="0.69" stopColor={primaryColor} stopOpacity="0.38"></stop>
          <stop offset="0.96" stopColor={primaryColor} stopOpacity="0.05"></stop>
          <stop offset="1" stopColor={primaryColor} stopOpacity="0"></stop>
        </radialGradient>
      </defs>
      <g>
        <ellipse opacity={0.1} cx="51" cy="55.48" fill="url(#a)" rx="51" ry="14.41"></ellipse>
        <path
          opacity={0.2}
          fill="url(#b)"
          d="M30.21 2.34A6 6 0 0 1 34.96 0h30.09c1.86 0 3.62.87 4.75 2.34l16.96 22.04A6 6 0 0 1 88 28.04V50c0 3.31-2.69 6-6 6H18.01c-3.31 0-6-2.69-6-6V28.04c0-1.32.44-2.61 1.24-3.66z"
        ></path>
        <path
          fill="#fff"
          opacity={0.4}
          fillRule="evenodd"
          d="M65.06 2H34.97c-1.24 0-2.41.58-3.17 1.56L14.84 25.6c-.54.7-.83 1.56-.83 2.44V50c0 2.21 1.79 4 4 4h64c2.21 0 4-1.79 4-4V28.04c0-.88-.29-1.74-.83-2.44L68.23 3.56A4.02 4.02 0 0 0 65.06 2m-30.1-2c-1.86 0-3.62.87-4.76 2.34L13.25 24.38a6 6 0 0 0-1.24 3.66V50c0 3.31 2.69 6 6 6h64c3.31 0 6-2.69 6-6V28.04c0-1.32-.44-2.61-1.24-3.66L69.81 2.34A6.02 6.02 0 0 0 65.06 0H34.97Z"
        ></path>
        <path
          fill="url(#c)"
          opacity={0.4}
          fillRule="evenodd"
          d="M65.06 1H34.97c-1.55 0-3.02.72-3.96 1.95L14.05 24.99a5.02 5.02 0 0 0-1.04 3.05V50c0 2.76 2.24 5 5 5h64c2.76 0 5-2.24 5-5V28.04c0-1.1-.36-2.17-1.04-3.05L69.02 2.95A5 5 0 0 0 65.06 1m-30.1-1c-1.86 0-3.62.87-4.76 2.34L13.25 24.38a6 6 0 0 0-1.24 3.66V50c0 3.31 2.69 6 6 6h64c3.31 0 6-2.69 6-6V28.04c0-1.32-.44-2.61-1.24-3.66L69.81 2.34A6.02 6.02 0 0 0 65.06 0H34.97Z"
        ></path>
        <path
          opacity={0.3}
          fill="url(#d)"
          d="M36.79 5c-.93 0-1.8.43-2.37 1.16l-11.65 15c-1.53 1.97-.13 4.84 2.37 4.84h12.87c.55 0 1 .45 1 1v6c0 1.66 1.34 3 3 3h17c1.66 0 3-1.34 3-3v-6c0-.55.45-1 1-1h11.87c2.5 0 3.9-2.87 2.37-4.84l-11.65-15A3 3 0 0 0 63.23 5H36.8Z"
        ></path>
      </g>
    </svg>
  );
};
