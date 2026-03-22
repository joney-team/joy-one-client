import { restClient } from "../apis/rest-client";

export async function convertExcelToJson(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return restClient.formData("/tools/excel-to-json", formData);
}

export async function detectQrCode(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return restClient.formData("/tools/detect-qr-code", formData);
}
