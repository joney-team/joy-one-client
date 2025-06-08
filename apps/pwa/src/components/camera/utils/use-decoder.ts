import { BarcodeDetector, type BarcodeDetectorOptions } from "barcode-detector";
import { useEffect, useRef } from "react";

export type Decoder = (imageData: ImageBitmapSource) => Promise<string | null>

const createDecoder = (opts?: BarcodeDetectorOptions) => {
  const detector = new BarcodeDetector(opts || {
    formats: [
      "aztec",
      "code_128",
      "code_39",
      "code_93",
      "codabar",
      "databar",
      "databar_expanded",
      "data_matrix",
      "dx_film_edge",
      "ean_13",
      "ean_8",
      "itf",
      "maxi_code",
      "micro_qr_code",
      "pdf417",
      "qr_code",
      "rm_qr_code",
      "upc_a",
      "upc_e",
      "linear_codes",
      "matrix_codes",
      "unknown",
    ]
  })

  return async (imageData: ImageBitmapSource) => {
    try {
      const decoded = await detector.detect(imageData);
      if (decoded.length)
        return decoded.at(0)?.rawValue ?? null
    } catch (e) {
      console.error(e)
    }
    return null
  }
}

export const useDecoder = (opts?: BarcodeDetectorOptions) => {
  const decoder = useRef<Decoder>(createDecoder(opts))
  useEffect(() => {
    decoder.current = createDecoder(opts)
  }, [opts])
  return decoder
}