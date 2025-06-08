import { BaseMongoEntity } from "@/types";

export interface PrescriptionItem {
  productId?: string;
  name: string;
  unit: string;
  qty: {
    morning?: number;
    noon?: number;
    afternoon?: number;
  },
  days: number;
  note?: string;
}

export interface PrescriptionEntity extends BaseMongoEntity {
  name: string;
  workspaceId: string;
  items: PrescriptionItem[];
  note?: string;
}

export interface PrescriptionDto {
  name: string;
  items: PrescriptionItem[];
  note?: string;
}