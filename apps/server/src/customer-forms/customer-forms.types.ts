import { registerEnumType } from "@nestjs/graphql";

export enum CustomerFormStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(CustomerFormStatus, {
  name: 'CustomerFormStatus',
  description: 'Available customer form statuses',
});

export interface CustomerFormEventData {
  name: string;
  phone: string;
  location: string;
  workspaceBranchId?: string;
  workspaceBranchName?: string;
  email?: string;
}