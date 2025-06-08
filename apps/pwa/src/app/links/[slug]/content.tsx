"use client";

import { LinkEntity } from "@/modules/links/links-types";
import dynamic from "next/dynamic";
import { FC } from "react";

interface LinkControllerProps {
  link: LinkEntity;
}

const PageContent = dynamic(() => import("./page-content").then((mod) => mod.PageContent), { ssr: false });

export const Content: FC<LinkControllerProps> = (props) => {
  return <PageContent link={props.link} />;
};
