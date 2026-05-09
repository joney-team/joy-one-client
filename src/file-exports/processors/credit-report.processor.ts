import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ExcelJS from 'exceljs';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { logger } from '../../app.logger';
import { DatabaseName } from '../../database/database.types';
import { withPostgresQuery } from '../../database/database.utils';
import { AppLocale } from '../../lang/lang.types';
import { translate } from '../../lang/lang.utils';

const t = (key: string, locale: AppLocale | string) =>
  translate(`credit_report_${key}`, locale as AppLocale);
import { CustomersService } from '../../customers/customers.service';
import { LoansService } from '../../loans/loans.service';
import { LoanPackageType, LoanReceiptData } from '../../loans/loans.types';
import { isPartialPayment } from '../../loans/loans.utils';
import { ReceiptEntity } from '../../receipts/entities/receipt.entity';
import { ReceiptStatus } from '../../receipts/receipts.types';
import { WorkspaceBranchesService } from '../../workspace-branches/workspace-branches.service';
import { WorkspaceMembersService } from '../../workspace-members/workspace-members.service';
import { FileExportEntity } from '../entities/file-export.entity';
import { CreditReportContextArgs } from '../file-exports.types';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

const CHUNK_SIZE = 500;
const EXPORT_DIR = 'public/files/workspaces';

// Match FE Object.values(LoanPackageType) order from GraphQL enum
const PACKAGE_TYPES: LoanPackageType[] = [
  LoanPackageType.FIXED_CAPITAL,
  LoanPackageType.INSTALLMENT,
  LoanPackageType.UNFIXED_CAPITAL,
];

const PACKAGE_TYPE_KEYS: Record<LoanPackageType, string> = {
  [LoanPackageType.FIXED_CAPITAL]: 'fixed_capital',
  [LoanPackageType.INSTALLMENT]: 'installment',
  [LoanPackageType.UNFIXED_CAPITAL]: 'unfixed_capital',
};

// ARGB colors
const COLOR_PRIMARY = 'FF2E7D32';
const COLOR_RED = 'FFC62828';
const COLOR_WHITE = 'FFFFFFFF';
const COLOR_BORDER = 'FFdee2e6';
const COLOR_POSITIVE_TEXT = 'FF2E7D32';

interface CreditReportRow {
  paidAt: number;
  branchName: string;
  customerName: string;
  cashierName: string;
  fee: Record<LoanPackageType, number>;
  capital: Record<LoanPackageType, number>;
  expense: Record<LoanPackageType, number>;
  advancePayment: number;
  amount: number;
}

@Injectable()
export class CreditReportProcessor {
  constructor(
    @InjectRepository(ReceiptEntity, DatabaseName.POSTGRES)
    private readonly receiptRepo: Repository<ReceiptEntity>,
    private readonly loans: LoansService,
    private readonly customers: CustomersService,
    private readonly workspaceBranches: WorkspaceBranchesService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  async process(entity: FileExportEntity): Promise<string> {
    const args = entity.contextArgs as CreditReportContextArgs;
    const { fromTime, toTime, workspaceBranchIds } = args;

    const member = await this.workspaceMembers.get({
      workspaceId: entity.workspaceId,
      userId: entity.userId,
    });

    const receipts = await this.fetchAllReceipts({
      member,
      fromTime,
      toTime,
      workspaceBranchIds,
    });

    const loanCodes = [
      ...new Set(receipts.map((r) => r.relatedLoanCode).filter(Boolean)),
    ] as string[];
    const customerIds = [
      ...new Set(receipts.map((r) => r.relatedCustomerId).filter(Boolean)),
    ] as string[];
    const branchIds = [
      ...new Set(
        receipts.map((r) => (r as any).workspaceBranchId).filter(Boolean),
      ),
    ] as string[];
    const cashierUserIds = [
      ...new Set(receipts.map((r) => r.cashierUserId).filter(Boolean)),
    ] as string[];

    const [loansMap, customersMap, branchesMap, cashiersMap] =
      await Promise.all([
        this.fetchLoansMap(loanCodes),
        this.fetchCustomersMap(customerIds),
        this.fetchBranchesMap(branchIds),
        this.fetchCashiersMap(cashierUserIds, entity.workspaceId),
      ]);

    const rows: CreditReportRow[] = [];

    for (const receipt of receipts) {
      const loan = loansMap.get(receipt.relatedLoanCode);
      const customer = customersMap.get(receipt.relatedCustomerId);

      if (!loan || !customer) continue;

      const receiptData = receipt.data as LoanReceiptData;
      const isAdvance = isPartialPayment(receipt);
      const loanType = loan.package.type;

      const capital = this.emptyPackageMap();
      const fee = this.emptyPackageMap();
      const expense = this.emptyPackageMap();

      if (!isAdvance && receiptData) {
        if (receiptData.liquidation) {
          capital[loanType] =
            receiptData.liquidationCalculated?.remainCapitalAmount ?? 0;
        } else if (receiptData.period?.capitalAmount > 0) {
          capital[loanType] = receiptData.period.capitalAmount;
        }

        fee[loanType] = receipt.amount - capital[loanType];

        if (receipt.amount < 0) {
          expense[loanType] = receipt.amount;
        }
      }

      const branchId = (receipt as any).workspaceBranchId;
      const branchName =
        branchesMap.get(branchId) ??
        t('main_office', entity.locale ?? AppLocale.vi);
      const cashierName = cashiersMap.get(receipt.cashierUserId) ?? '--';

      rows.push({
        paidAt: receipt.paidAt,
        branchName,
        customerName: customer.name ?? '--',
        cashierName,
        fee,
        capital,
        expense,
        advancePayment: isAdvance ? receipt.amount : 0,
        amount: receipt.amount,
      });
    }

    return this.buildExcel({
      rows,
      workspaceId: entity.workspaceId,
      exportId: entity._id.toString(),
      fileName: entity.fileName,
      locale: entity.locale,
    });
  }

  private emptyPackageMap(): Record<LoanPackageType, number> {
    return {
      [LoanPackageType.FIXED_CAPITAL]: 0,
      [LoanPackageType.UNFIXED_CAPITAL]: 0,
      [LoanPackageType.INSTALLMENT]: 0,
    };
  }

  private async fetchAllReceipts(args: {
    member: WorkspaceMember;
    fromTime: number;
    toTime: number;
    workspaceBranchIds?: string[];
  }): Promise<ReceiptEntity[]> {
    const { member, fromTime, toTime, workspaceBranchIds } = args;

    const query: Record<string, any> = {
      status: ReceiptStatus.PAID,
      rangePaidAt: `${fromTime}-${toTime}`,
    };

    if (workspaceBranchIds?.length) {
      query.workspaceBranchIds = workspaceBranchIds.join(',');
    }

    const baseOptions = withPostgresQuery<ReceiptEntity>({
      member,
      query,
      filterFields: ['status'],
      filterRangeFields: ['paidAt'],
      order: { paidAt: 'ASC' },
    });

    const results: ReceiptEntity[] = [];
    let offset = 0;

    while (true) {
      const batch = await this.receiptRepo.find({
        ...baseOptions,
        take: CHUNK_SIZE,
        skip: offset,
      });

      results.push(...batch);
      if (batch.length < CHUNK_SIZE) break;
      offset += CHUNK_SIZE;
    }

    return results;
  }

  private async fetchLoansMap(codes: string[]) {
    const map = new Map<string, any>();
    await Promise.all(
      codes.map(async (code) => {
        try {
          const loan = await this.loans.getByCode({ code });
          map.set(code, loan);
        } catch {
          logger.warn(`[CreditReport] Loan not found: ${code}`);
        }
      }),
    );
    return map;
  }

  private async fetchCustomersMap(ids: string[]) {
    const map = new Map<string, any>();
    if (!ids.length) return map;
    const customers = await this.customers.getByIds(ids);
    for (const c of customers) map.set(c._id?.toString(), c);
    return map;
  }

  private async fetchCashiersMap(userIds: string[], workspaceId: string) {
    const map = new Map<string, string>();
    if (!userIds.length) return map;
    const members = await this.workspaceMembers.getInfoByUserIds({
      userIds,
      workspaceId,
    });
    for (const m of members) map.set(m.userId, m.name);
    return map;
  }

  private async fetchBranchesMap(ids: string[]) {
    const map = new Map<string, string>();
    if (!ids.length) return map;
    const branches = await this.workspaceBranches.getByIds(ids, [
      '_id',
      'name',
    ]);
    for (const b of branches) map.set(b._id?.toString(), b.name);
    return map;
  }

  private async buildExcel(args: {
    rows: CreditReportRow[];
    workspaceId: string;
    exportId: string;
    fileName?: string;
    locale?: string;
  }): Promise<string> {
    const { rows, workspaceId, exportId, fileName, locale = 'vi' } = args;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(t('sheet_name', locale));

    // ── Column widths ─────────────────────────────────────────────
    ws.columns = [
      { width: 12 }, // Thời gian
      { width: 22 }, // Chi nhánh
      { width: 22 }, // Khách hàng
      { width: 22 }, // Thu ngân
      ...PACKAGE_TYPES.map(() => ({ width: 18 })), // Thu lãi
      ...PACKAGE_TYPES.map(() => ({ width: 18 })), // Thu gốc
      ...PACKAGE_TYPES.map(() => ({ width: 18 })), // Chi gốc
      { width: 16 }, // Ứng trước
      { width: 16 }, // Hoá đơn
    ];

    // ── Freeze panes (2 header rows, 3 left cols) ─────────────────
    ws.views = [{ state: 'frozen', xSplit: 3, ySplit: 2 }];

    const headFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR_PRIMARY },
    };
    const headFont: Partial<ExcelJS.Font> = {
      bold: true,
      color: { argb: COLOR_WHITE },
      size: 13,
    };
    const headAlignment = (
      h: ExcelJS.Alignment['horizontal'] = 'center',
    ): Partial<ExcelJS.Alignment> => ({
      horizontal: h,
      vertical: 'middle',
      wrapText: true,
    });
    const borderStyle: Partial<ExcelJS.Border> = {
      style: 'thin',
      color: { argb: COLOR_BORDER },
    };
    const allBorders: Partial<ExcelJS.Borders> = {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
    };

    const applyHeadStyle = (
      cell: ExcelJS.Cell,
      align: ExcelJS.Alignment['horizontal'] = 'center',
    ) => {
      cell.fill = headFill;
      cell.font = headFont;
      cell.alignment = headAlignment(align);
      cell.border = allBorders;
    };

    // ── Row 1: group headers ──────────────────────────────────────
    const r1 = ws.getRow(1);
    r1.height = 30;

    const setR1 = (
      col: number,
      value: string,
      align?: ExcelJS.Alignment['horizontal'],
    ) => {
      const cell = r1.getCell(col);
      cell.value = value;
      applyHeadStyle(cell, align);
    };

    setR1(1, t('time', locale));
    setR1(2, t('branch', locale));
    setR1(3, t('customer', locale));
    setR1(4, t('member', locale));
    setR1(5, t('interest_income', locale), 'center');
    setR1(5 + PACKAGE_TYPES.length, t('principal_income', locale), 'center');
    setR1(
      5 + PACKAGE_TYPES.length * 2,
      t('principal_expense', locale),
      'center',
    );
    setR1(5 + PACKAGE_TYPES.length * 3, t('advance_payment', locale), 'right');
    setR1(5 + PACKAGE_TYPES.length * 3 + 1, t('receipt', locale), 'right');

    // ── Row 2: sub-headers ────────────────────────────────────────
    const r2 = ws.getRow(2);
    r2.height = 25;

    const setR2 = (col: number, value: string) => {
      const cell = r2.getCell(col);
      cell.value = value;
      applyHeadStyle(cell, 'center');
    };

    PACKAGE_TYPES.forEach((type, i) => {
      const label = t(PACKAGE_TYPE_KEYS[type], locale);
      setR2(5 + i, label);
      setR2(5 + PACKAGE_TYPES.length + i, label);
      setR2(5 + PACKAGE_TYPES.length * 2 + i, label);
    });

    // Fill header style on rowSpan cells in row 2 (cols 1-4 and last 2)
    [1, 2, 3, 4].forEach((col) => applyHeadStyle(r2.getCell(col)));
    applyHeadStyle(r2.getCell(5 + PACKAGE_TYPES.length * 3), 'right');
    applyHeadStyle(r2.getCell(5 + PACKAGE_TYPES.length * 3 + 1), 'right');

    // ── Merge cells ───────────────────────────────────────────────
    const n = PACKAGE_TYPES.length;
    ws.mergeCells(1, 1, 2, 1); // Thời gian
    ws.mergeCells(1, 2, 2, 2); // Chi nhánh
    ws.mergeCells(1, 3, 2, 3); // Khách hàng
    ws.mergeCells(1, 4, 2, 4); // Thu ngân
    ws.mergeCells(1, 5, 1, 5 + n - 1); // Thu lãi
    ws.mergeCells(1, 5 + n, 1, 5 + n * 2 - 1); // Thu gốc
    ws.mergeCells(1, 5 + n * 2, 1, 5 + n * 3 - 1); // Chi gốc
    ws.mergeCells(1, 5 + n * 3, 2, 5 + n * 3); // Ứng trước
    ws.mergeCells(1, 5 + n * 3 + 1, 2, 5 + n * 3 + 1); // Hoá đơn

    // ── Data rows ─────────────────────────────────────────────────
    const numFmt = '#,##0';
    const dataFont: Partial<ExcelJS.Font> = { size: 13 };

    rows.forEach((row) => {
      const r = ws.addRow([
        new Date(row.paidAt * 1000).toLocaleDateString(locale),
        row.branchName,
        row.customerName,
        row.cashierName,
        ...PACKAGE_TYPES.map((t) => row.fee[t]),
        ...PACKAGE_TYPES.map((t) => row.capital[t]),
        ...PACKAGE_TYPES.map((t) => row.expense[t]),
        row.advancePayment,
        row.amount,
      ]);

      r.height = 20;
      r.font = dataFont;
      r.alignment = { vertical: 'middle', wrapText: true };

      // Number format for numeric cols (5 onwards)
      for (let c = 5; c <= 4 + n * 3 + 2; c++) {
        r.getCell(c).numFmt = numFmt;
      }

      // Color the receipt (last col)
      const amountCell = r.getCell(5 + n * 3 + 1);
      amountCell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (row.amount > 0)
        amountCell.font = { ...dataFont, color: { argb: COLOR_POSITIVE_TEXT } };
      else if (row.amount < 0)
        amountCell.font = { ...dataFont, color: { argb: COLOR_RED } };
    });

    // ── Total row ─────────────────────────────────────────────────
    const totalRowIndex = rows.length + 3;
    const totalFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR_PRIMARY },
    };
    const applyTotalCell = (
      cell: ExcelJS.Cell,
      value: any,
      align: ExcelJS.Alignment['horizontal'] = 'right',
    ) => {
      cell.fill = totalFill;
      cell.font = headFont;
      cell.alignment = { horizontal: align, vertical: 'middle' };
      cell.border = allBorders;
      cell.value = value;
    };
    const applyTotalNum = (cell: ExcelJS.Cell, value: number) => {
      applyTotalCell(cell, value);
      cell.numFmt = numFmt;
      if (value < 0)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLOR_RED },
        };
    };

    const tr = ws.getRow(totalRowIndex);
    tr.height = 25;

    applyTotalCell(tr.getCell(1), t('total', locale), 'right');
    [2, 3, 4].forEach((c) => applyTotalCell(tr.getCell(c), null));

    PACKAGE_TYPES.forEach((type, i) => {
      applyTotalNum(
        tr.getCell(5 + i),
        rows.reduce((s, r) => s + r.fee[type], 0),
      );
      applyTotalNum(
        tr.getCell(5 + n + i),
        rows.reduce((s, r) => s + r.capital[type], 0),
      );
      applyTotalNum(
        tr.getCell(5 + n * 2 + i),
        rows.reduce((s, r) => s + r.expense[type], 0),
      );
    });

    applyTotalNum(
      tr.getCell(5 + n * 3),
      rows.reduce((s, r) => s + r.advancePayment, 0),
    );
    applyTotalNum(
      tr.getCell(5 + n * 3 + 1),
      rows.reduce((s, r) => s + r.amount, 0),
    );

    // Merge "Tổng cộng" across cols 1-3
    ws.mergeCells(totalRowIndex, 1, totalRowIndex, 3);

    // ── Write file ────────────────────────────────────────────────
    const dirPath = join(EXPORT_DIR, workspaceId);
    if (!existsSync(dirPath)) await mkdir(dirPath, { recursive: true });

    const resolvedFileName = `${fileName ?? `export-${exportId}`}.xlsx`;
    const filePath = join(dirPath, resolvedFileName);
    await wb.xlsx.writeFile(filePath);

    return `/public/files/workspaces/${workspaceId}/${resolvedFileName}`;
  }
}
