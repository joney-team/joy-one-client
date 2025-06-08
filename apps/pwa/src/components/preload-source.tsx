"use client";

import { FC, Fragment, useEffect } from "react";
import resource from "@/app.resource.json";
import { loadImage } from "@/utils/asset.utils";

const PreloadResource: FC = () => {
  useEffect(() => {
    // Preload resource
    Promise.all(
      resource.images.map((image: string) => {
        loadImage(image).catch(() => false);
      })
    );
  }, []);

  return <Fragment />;
};

export default PreloadResource;
