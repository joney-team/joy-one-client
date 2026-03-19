import { renderFileUrl } from "./files-utils";
import { FileDataFragment } from "./graphql/fragmentFile.graphql";
import { PDFViewer } from "@embedpdf/react-pdf-viewer";

import styles from "./file-pdf-viewer.module.css";

export const FilePdfViewer = ({ file }: { file: Pick<FileDataFragment, "url"> }) => {
  return (
    <div className={styles.FilePdfViewer}>
      <PDFViewer
        config={{
          src: renderFileUrl(file.url),
          theme: { preference: "light" },
          disabledCategories: [
            "annotation",
            "print",
            "export",
            "redaction",
            "document",
            "panel-comment",
          ],
        }}
      />
    </div>
  );
};
