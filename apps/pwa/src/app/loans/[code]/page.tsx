import { restServerClient } from "@/modules/apis/server";
import { AppPageMetadata } from "@/types";
import { Metadata, NextPage, ResolvingMetadata } from "next";
import Content from "./page-content";

export async function generateMetadata(props: any, _: ResolvingMetadata): Promise<Metadata> {
  const { code } = await props.params;
  const metadata = await restServerClient
    .get<AppPageMetadata>(`/loans/metadata/${code}`)
    .catch(() => null);
  if (!metadata) return {};

  const title = metadata.title;
  const description = metadata.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [],
    },
    robots: {
      index: false,
      nocache: true,
    },
  };
}

const Page: NextPage = () => <Content />;

export default Page;
