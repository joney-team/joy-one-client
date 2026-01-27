import { api } from "@/modules/apis";
import { ResponseList } from "@/types";
import { useForceUpdate } from "@mantine/hooks";
import { useEffect } from "react";
import { BankInformation, BankQrCode } from "./banks.types";
import { PluginBankAccount } from "@/graphql/types.graphql";

let banks: BankInformation[] = [];

export async function getBanks() {
  if (banks.length) return { data: banks, count: banks.length };
  try {
    const data = await api.get<ResponseList<BankInformation>>(`/plugins/banks`);
    banks = data.data;
    return data;
  } catch (error) {
    return { data: banks, count: banks.length };
  }
}

export const useBanks = () => {
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    getBanks().then(() => forceUpdate());
  }, []);

  return banks;
};

export async function getQrCodePaymentUrl(
  bankAccount: PluginBankAccount,
  payload: { amount: number; description?: string }
) {
  const banks = await getBanks();
  const bank = banks.data.find((v) => v.id === bankAccount.bankId);
  let url = `https://img.vietqr.io/image/${bank?.bin}-${bankAccount.accountNumber}-compact.jpg`;
  const query = new URLSearchParams();
  if (payload.description) query.set("addInfo", payload.description);
  if (payload.amount) query.set("amount", payload.amount.toString());
  if (bankAccount.accountName) query.set("accountName", bankAccount.accountName);
  return `${url}?${query.toString()}`;
}

export async function getQrCode(
  bankAccount: PluginBankAccount,
  payload: { amount: number; description?: string }
): Promise<BankQrCode> {
  const banks = await getBanks();
  const bank = banks.data.find((v) => v.id === bankAccount.bankId);
  if (!bank) throw Error("Không tìm thấy thông tin ngân hàng");
  return getStaticQrCode(bank, bankAccount, payload);
}

export function getStaticQrCode(
  bank: BankInformation,
  bankAccount: PluginBankAccount,
  payload: {
    amount: number;
    description?: string;
  }
): BankQrCode {
  let url = `https://img.vietqr.io/image/${bank?.bin}-${bankAccount.accountNumber}-compact.jpg`;
  const query = new URLSearchParams();
  if (payload.description) query.set("addInfo", payload.description);
  if (payload.amount) query.set("amount", payload.amount.toString());
  if (bankAccount.accountName) query.set("accountName", bankAccount.accountName);

  return {
    url: `${url}?${query.toString()}`,
    bank,
    account: {
      bankId: bankAccount.bankId,
      accountNumber: bankAccount.accountNumber,
      accountName: bankAccount.accountName || "",
    },
  };
}

export function getTransactionInfo(input?: string) {
  if (!input) return "";
  return input
    .normalize("NFD") // Chuyển chuỗi sang dạng chuẩn NFD để tách các dấu diacritics
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu diacritics
    .replace(/[^a-zA-Z0-9\s]/g, "") // Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái và số
    .substring(0, 25); // Cắt chuỗi để độ dài không vượt quá 25 ký tự
}
