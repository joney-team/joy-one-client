import { BaseMongoEntity } from "@/types";
import { LocationEntity } from "@/modules/locations/locations-types";
import { BankAccount } from "../plugins/banks/banks.types";

export interface WorkspaceBranchSettings {
  bankAccount?: Partial<BankAccount>;
}

export interface WorkspaceBranchEntity extends BaseMongoEntity {
  workspaceId: string;
  name: string;
  hotline?: string;
  location?: LocationEntity;
  settings?: WorkspaceBranchSettings;
}

export interface WorkspaceBranchDto {
  name: string;
  hotline?: string;
  location?: LocationEntity;
  settings?: WorkspaceBranchSettings;
}