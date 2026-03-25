import { renderFileUrl } from "./files-utils";
import { FileFragment } from "./graphql/fragmentFile.graphql";
import { PDFViewer } from "@embedpdf/react-pdf-viewer";

import styles from "./file-pdf-viewer.module.css";

export const FilePdfViewer = ({ file }: { file: Pick<FileFragment, "url"> }) => {
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
