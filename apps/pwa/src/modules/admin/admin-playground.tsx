import { useInViewport } from "@/hooks/use-in-viewport";
import { Box, Stack } from "@mantine/core";
import { useEffect, type FC } from "react";

const data = [
  { name: "1", height: 30, background: "blue" },
  { name: "2", height: 30, background: "red" },
  { name: "3", height: 30, background: "yellow" },
  { name: "4", height: 30, background: "gray" },
  { name: "5", height: 30, background: "teal" },
  { name: "6", height: 30, background: "green" },
];

const InViewportComp: FC<(typeof data)[number]> = ({ name, background }) => {
  const inViewport = useInViewport();

  useEffect(() => {
    if (inViewport.inViewport) {
      console.debug("InView", name);
    } else {
      console.warn("OutView", name);
    }
  }, [inViewport.inViewport]);

  return (
    <Box h={300} bg={background} ref={inViewport.ref} opacity={inViewport ? 1 : 0.1}>
      {name}
    </Box>
  );
};

export const AdminPlayground: FC = () => {
  return (
    <Stack>
      {data.map((item, index) => (
        <InViewportComp key={index} {...item} />
      ))}
    </Stack>
  );
};
