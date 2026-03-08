"use client";

import { Container } from "@/components/container";
import { useParams } from "next/navigation";
import { type FC } from "react";
import { ReceiptDetail } from "./receipt-detail";

export const ReceiptDetailPage: FC = () => {
  const params = useParams<{ id: string }>();
  const receiptId = params.id;

  return (
    <Container p="md">
      <ReceiptDetail receiptId={receiptId} />
    </Container>
  );
};
