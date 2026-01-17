import type { CSSProperties, JSX, ReactNode } from "react";

import styles from "./aspect-ratio.module.css";
import { classNames } from "@/utils/ui.utils";

export default function AspectRatio({
  ratio,
  children,
  className,
  style,
}: {
  children?: ReactNode;
  ratio: number;
  className?: string;
  style?: CSSProperties;
}): JSX.Element {
  return (
    <div className={classNames(styles.AspectRatio, className)} style={style}>
      <div style={{ paddingBottom: `${(1 / ratio) * 100}%` }} />
      {children && <div className={styles.AspectRatioContent}>{children}</div>}
    </div>
  );
}
