import { getFileSizeFromUrl } from "@joy-one-client/utils/files";
import { useEffect, useState } from "react";

export const useFileSize = (url: string | null) => {
  const [size, setSize] = useState<null | number>(null);

  const process = async () => {
    if (!url || url.length === 0) return setSize(null);
    await getFileSizeFromUrl(url)
      .then((s) => setSize(s))
      .catch(() => setSize(null));
  };

  useEffect(() => {
    process();
  }, [url]);

  return { size };
};
