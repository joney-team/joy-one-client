import { apiTools } from "../apis";

export async function convertExcelToJson(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiTools.formData('/tools/excel-to-json', formData)
}

export async function detectQrCode(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiTools.formData('/tools/detect-qr-code', formData)
}