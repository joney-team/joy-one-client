"use client";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";

const ProductComboLayout = dynamic(
  () => import("@/modules/product-combos/product-combos-layout").then((m) => m.ProductComboLayout),
  { ssr: false, loading: nonLoading },
);

export default function CombosLayout({ children }: { children: React.ReactNode }) {
  return <ProductComboLayout>{children}</ProductComboLayout>;
}
