import { AppPageMetadata } from "@/types";
import { MainRequest } from "@/modules/requests/main.request";
import { Metadata, NextPage, ResolvingMetadata } from "next";
import Content from "./page-content";

export async function generateMetadata(props: any, _: ResolvingMetadata): Promise<Metadata> {
  const { code } = await props.params;
  const metadata = await MainRequest.get<AppPageMetadata>(`/loans/metadata/${code}`).catch(() => null);
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
