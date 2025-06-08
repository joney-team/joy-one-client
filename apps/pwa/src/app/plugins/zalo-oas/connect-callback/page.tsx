"use client";

import { LazyLoad } from "@/components/lazy-load";
import { NextPage } from "next";
import dynamic from "next/dynamic";

const Content = dynamic(() => import("./page-content"), { ssr: false, loading: () => <LazyLoad /> });
const Page: NextPage = (props) => <Content {...props} />;

export default Page;
