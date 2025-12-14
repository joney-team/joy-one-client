import { api } from "../apis";

export async function convertExcelToJson(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.formData("/tools/excel-to-json", formData);
}

export async function detectQrCode(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.formData("/tools/detect-qr-code", formData);
}
