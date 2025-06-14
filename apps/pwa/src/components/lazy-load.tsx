import dynamic, { DynamicOptionsLoadingProps } from "next/dynamic";
import { FC } from "react";

const Skeleton = dynamic(() => import("@mantine/core").then((mod) => mod.Skeleton), { ssr: false });
const Stack = dynamic(() => import("@mantine/core").then((mod) => mod.Stack), { ssr: false });
interface LazyLoadProps {
  p?: number;
}

export const PageLazyLoad: FC = () => {
  return <LazyLoad p={16} />;
};

export const PageLoading: (loadingProps: DynamicOptionsLoadingProps) => JSX.Element = () => {
  return <LazyLoad p={16} />;
};

export const LazyLoad: FC<LazyLoadProps> = ({ p }) => {
  return (
    <Stack p={p}>
      <Skeleton height="50dvh" />
    </Stack>
  );
};
