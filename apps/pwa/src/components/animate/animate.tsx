"use client";

import { CSSProperties, FC, useEffect, useState } from "react";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";
import styles from "./animate.module.css";

const Lottie = dynamic(() => import("@lottielab/lottie-player/react"), {
  ssr: false,
  loading: nonLoading,
});

export interface AnimateProps {
  src: string;
  style?: CSSProperties;
}

export const Animate: FC<AnimateProps> = (props) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return <Lottie className={styles.Animate} src={props.src} autoplay style={props.style} />;
};
