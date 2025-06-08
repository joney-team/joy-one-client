import { ResponseList } from "@/types";
import { uploadFile } from "../files/file-service";
import { t } from "../lang/lang-service";
import { ReceiptEntity } from "../receipts/receipts-types";
import { MainRequest } from "../requests/main.request";
import {
  LoanAssetEstimations,
  LoanEntity, LoanLiquidationCalculated, LoanPackageType,
  LoanPaymentPlanResult, LoanStatus,
} from "./loans-types";

import {
  CreateLoanDto, FulfillLoanDto, GetPaymentPlanDto,
  ImportLoanDto,
  RejectLoanDto, SignLoanDto, UpdateLoanAmountDto,
  UpdateLoanAssetDataDto, UpdateLoanPackageDto, UpdateLoanWorkspaceBranchDto
} from "./loan-dtos";

export async function getLoans(query?: any, controller?: AbortController) {
  return MainRequest.get<ResponseList<LoanEntity>>('/loans', query, controller);
}

export async function getLoan(id: string) {
  return MainRequest.get<LoanEntity>(`/loans/${id}`);
}

export async function getLoanByCode(code: string) {
  return MainRequest.get<LoanEntity>(`/loans/codes/${code}`);
}

export async function createLoan(dto: CreateLoanDto) {
  const assetData = await prepareLoanAssetData(dto.assetData);
  return MainRequest.post<LoanEntity>(`/loans`, { ...dto, assetData });
}

export async function signLoan(id: string, dto: SignLoanDto) {
  return MainRequest.post(`/loans/${id}/sign`, dto);
}

export async function importLoan(dto: ImportLoanDto) {
  return MainRequest.post(`/loans/import`, dto);
}

export async function updateLoanAmount(id: string, dto: UpdateLoanAmountDto) {
  return MainRequest.put(`/loans/${id}/amount`, dto);
}

export async function updateLoanAssetData(id: string, dto: UpdateLoanAssetDataDto) {
  const assetData = await prepareLoanAssetData(dto.assetData);
  return MainRequest.put(`/loans/${id}/asset-data`, { ...dto, assetData });
}

export async function updateLoanPackage(id: string, dto: UpdateLoanPackageDto) {
  return MainRequest.put(`/loans/${id}/package`, dto);
}

export async function updateLoanWorkspaceBranch(dto: UpdateLoanWorkspaceBranchDto) {
  return MainRequest.put(`/loans/workspace-branch`, dto);
}

export async function approveLoan(id: string) {
  return MainRequest.post(`/loans/${id}/approve`);
}

export async function rejectLoan(id: string, dto: RejectLoanDto) {
  return MainRequest.post(`/loans/${id}/reject`, dto);
}

export async function fulfillLoan(id: string, dto: FulfillLoanDto) {
  return MainRequest.post(`/loans/${id}/fulfill`, dto);
}

export async function completeLoan(id: string) {
  return MainRequest.post(`/loans/${id}/complete`);
}

export async function archiveLoan(id: string) {
  return MainRequest.delete(`/loans/${id}`);
}

export async function archiveLoans(loanIds: string[]) {
  return MainRequest.delete(`/loans/archive`, { loanIds });
}

export async function prepareLoanAssetData(data: any) {
  let _data = { ...data };

  // Upload files
  if (Array.isArray(_data.images)) {
    for (let i = 0; i < _data.images.length; i++) {
      const f = _data.images[i];
      if (f instanceof File) {
        const _file = await uploadFile({ file: f, });
        _data.images[i] = _file.relativePath;
      }
    }
  }

  if (Array.isArray(_data.receipts)) {
    for (let i = 0; i < _data.receipts.length; i++) {
      const f = _data.receipts[i];
      if (f instanceof File) {
        const _file = await uploadFile({ file: f, });
        _data.receipts[i] = _file.relativePath;
      }
    }
  }

  if (_data.driverLicenseImages?.front instanceof File) {
    const _file = await uploadFile({ file: _data.driverLicenseImages.front });
    _data.driverLicenseImages.front = _file.relativePath;
  }

  if (_data.driverLicenseImages?.back instanceof File) {
    const _file = await uploadFile({ file: _data.driverLicenseImages.back });
    _data.driverLicenseImages.back = _file.relativePath;
  }

  return _data
}

export async function loanLiquidation(id: string) {
  return MainRequest.post<ReceiptEntity>(`/loans/${id}/liquidation`);
}

export async function revertLiquidationLoan(id: string) {
  return MainRequest.post(`/loans/${id}/revert-liquidation`);
}

export async function getLoanPaymentPlan(dto: GetPaymentPlanDto) {
  return MainRequest.post<LoanPaymentPlanResult>(`/loans/payment-plan`, dto);
}

export const loanStatusColors: {
  [key in LoanStatus]: string
} = {
  [LoanStatus.PENDING_SIGN]: 'gray',
  [LoanStatus.PENDING]: 'gray',
  [LoanStatus.APPROVED]: 'violet',
  [LoanStatus.FULFILLED]: 'orange',
  [LoanStatus.REJECTED]: 'red',
  [LoanStatus.COMPLETED]: 'green',
  [LoanStatus.OVERDUE]: 'red',
}

export const defaultLoanAssetEstimations: LoanAssetEstimations = {
  brands: [],
  estimations: [],
  models: [],
  colors: [],
}

export async function getLoanAssetEstimations(): Promise<LoanAssetEstimations> {
  try {
    let data = await MainRequest.get(`/loans/asset-estimations`);

    Object.keys(defaultLoanAssetEstimations).forEach(key => {
      if (typeof data[key] === 'undefined') {
        data[key] = (defaultLoanAssetEstimations as any)[key];
      }
    });

    return data;
  } catch (error) {
    return defaultLoanAssetEstimations;
  }
}

export async function setLoanAssetEstimations(data: LoanAssetEstimations) {
  await MainRequest.post(`/loans/asset-estimations`, data);
}

export async function healthCheckLoan(loanId: string) {
  return MainRequest.post<LoanEntity>(`/loans/${loanId}/health-check`);
}

export const loanPackageTypeColors: {
  [key in LoanPackageType]: string
} = {
  [LoanPackageType.FIXED_CAPITAL]: 'violet',
  [LoanPackageType.UNFIXED_CAPITAL]: 'grape',
  [LoanPackageType.INSTALLMENT]: 'green',
}

export function renderLoanPeriod(days: number) {
  const month = Math.ceil(days / 30);
  if (days >= 30 && Number.isInteger(month)) {
    return `${month} ${t('months')}`;
  }

  return `${days} ${t('days')}`;
}

export async function loanLiquidationCalculate(id: string) {
  return MainRequest.post<LoanLiquidationCalculated>(`/loans/${id}/liquidation/calculate`);
}