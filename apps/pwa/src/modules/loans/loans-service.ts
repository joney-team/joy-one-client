import { t } from "@lingui/core/macro";
import { UseUploadFile } from "../files/hooks/use-upload-file";

export async function prepareLoanAssetData(data: any, uploadFile: UseUploadFile) {
  let _data = { ...data };

  // Upload files
  if (Array.isArray(_data.images)) {
    for (let i = 0; i < _data.images.length; i++) {
      const f = _data.images[i];
      if (f instanceof File) {
        const _file = await uploadFile(f);
        _data.images[i] = _file.path;
      }
    }
  }

  if (Array.isArray(_data.receipts)) {
    for (let i = 0; i < _data.receipts.length; i++) {
      const f = _data.receipts[i];
      if (f instanceof File) {
        const _file = await uploadFile(f);
        _data.receipts[i] = _file.path;
      }
    }
  }

  if (_data.driverLicenseImages?.front instanceof File) {
    const _file = await uploadFile(_data.driverLicenseImages.front);
    _data.driverLicenseImages.front = _file.path;
  }

  if (_data.driverLicenseImages?.back instanceof File) {
    const _file = await uploadFile(_data.driverLicenseImages.back);
    _data.driverLicenseImages.back = _file.path;
  }

  return _data;
}

export function renderLoanPeriod(days: number) {
  const month = Math.ceil(days / 30);
  if (days >= 30 && Number.isInteger(month)) {
    return `${month} ${t`months`}`;
  }

  return `${days} ${t`days`}`;
}
