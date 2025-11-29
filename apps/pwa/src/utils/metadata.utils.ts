import { type AppPageMetadata } from "@/types";
import { AppLocale } from "@/modules/lang/lang-types";
import { getLocaleServer } from "@/modules/lang/lang-server-service";
import { Metadata, ResolvingMetadata } from "next";

type MetadataProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type FetchProps = {
  locale: AppLocale;
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const combineMetadata = (args: {
  fetch: (props: FetchProps) => Promise<AppPageMetadata | null> | AppPageMetadata;
}) => {
  const { fetch } = args;

  return async (props: MetadataProps, parent: ResolvingMetadata): Promise<Metadata> => {
    const [params, searchParams, parentMetadata, locale] = await Promise.all([
      props.params,
      props.searchParams,
      parent,
      getLocaleServer(),
    ]);

    try {
      let metadata: AppPageMetadata | null = null;

      try {
        metadata = await fetch({ params, searchParams, locale });
      } catch (error) {}

      const title = metadata?.title || parentMetadata.title || "";
      const description = metadata?.description || parentMetadata.description || "";
      const images = metadata?.images || parentMetadata.openGraph?.images || [];
      const icons = metadata?.icons || parentMetadata.icons;

      return {
        title,
        description,
        icons,
        openGraph: {
          title,
          description,
          images,
        },
      };
    } catch (error) {
      console.error(`[Metadata] Error: ${error}`);
      return parentMetadata as Metadata;
    }
  };
};
