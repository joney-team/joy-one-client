import { ReceiptFragment } from "../graphql/fragmentReceipt.graphql";

export function isPartialPayment(receipt: Pick<ReceiptFragment, "data" | "ref">) {
  return (
    receipt &&
    receipt.ref &&
    ((receipt.ref.includes("-PARTIAL") && !receipt.ref.includes("-PARTIAL-NEXT")) ||
      receipt.data?.partial)
  );
}
