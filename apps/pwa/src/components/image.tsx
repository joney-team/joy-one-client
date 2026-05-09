"use client";

import { renderFileUrl } from "@/modules/files/files-utils";
import config from "@joy-one/config";
import { Trans } from "@lingui/react/macro";
import { Center, ImageProps, Image as MantineImage, Stack } from "@mantine/core";
import { FC, useState } from "react";
import { Loading } from "./loading";

interface Props extends ImageProps {
  alt?: string;
  showLoading?: boolean;
}

export const Image: FC<Props> = (props) => {
  const [loaded, setLoaded] = useState(false);
  const fallbackSrc = props.fallbackSrc || `${config.APP_URL}/images/fallback.png`;

  const _props = { ...props };

  delete _props.showLoading;

  if (props.showLoading) {
    return (
      <Stack justify="center" align="center" maw="100%" mah="100%">
        {props.showLoading && !loaded && <Loading message={<Trans>Image loading</Trans>} />}

        <MantineImage
          {..._props}
          src={renderFileUrl(props.src)}
          alt={props.alt}
          style={{
            maxWidth: "100%",
            objectFit: "contain",
            ...props.style,
          }}
          onLoad={() => setLoaded(true)}
          fallbackSrc={fallbackSrc}
        />
      </Stack>
    );
  }

  return (
    <Center maw="100%" mah="100%">
      <MantineImage
        {..._props}
        src={renderFileUrl(props.src)}
        alt={props.alt}
        style={{
          maxWidth: "100%",
          objectFit: "contain",
          ...props.style,
        }}
        onLoad={() => setLoaded(true)}
        fallbackSrc={fallbackSrc}
      />
    </Center>
  );
};
