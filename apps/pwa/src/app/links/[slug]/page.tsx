import { apiServerSide } from "@/modules/apis/server";
import { renderLink } from "@/modules/files/files-utils";
import { LinkEntity } from "@/modules/links/links-types";
import config from "@joy-one-client/config";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Content } from "./content";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const link = await apiServerSide.get<LinkEntity>(`/links/${props.params.slug}`).catch(() => null);
  if (link) {
    return {
      title: link.title || "Joy One",
      description: link.description,
      icons: {
        icon: renderLink(link.thumbnail) || "/favicon.ico",
      },
      openGraph: {
        images: link.thumbnail ? [renderLink(link.thumbnail)!] : undefined,
      },
    };
  }

  return {
    title: "Joy One",
  };
}

export default async function Page(props: { params: { slug: string } }) {
  const ignoreSlug = ["favicon.ico"];
  if (!props.params.slug || ignoreSlug.includes(props.params.slug)) {
    return null;
  }

  const link = await apiServerSide.get<LinkEntity>(`/links/${props.params.slug}`).catch(() => null);
  if (!link) redirect(config.APP_URL);

  return <Content link={link} />;
}
