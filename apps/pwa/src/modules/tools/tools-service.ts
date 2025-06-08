import { MainRequest } from "../requests/main.request";

export async function convertExcelToJson(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return MainRequest.postFormData('/tools/excel-to-json', formData)
}

export async function detectQrCode(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return MainRequest.postFormData('/tools/detect-qr-code', formData)
}