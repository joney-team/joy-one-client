import type { BaseMongoEntity } from '@/types';
import { LocationEntity } from '../locations/locations-types';
import { CustomerFormStatus } from './customer-form-types';

export interface CustomerFormEntity extends Omit<BaseMongoEntity, 'workspaceId' | 'workspaceBranchId'> {
  name: string;
  phone: string;
  email?: string;
  location?: LocationEntity;
  vnLocation?: LocationEntity;
  dynamicData?: any;
  status: CustomerFormStatus;
  workspaceId: string;
  workspaceBranchId?: string | null;
  cancelReason?: string | null;
}
