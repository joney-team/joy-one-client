import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CustomerEntity } from './customers.entity';

@ObjectType()
export class CustomerRelationshipContact {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  phone: string;

  @Field()
  @IsString()
  type: string;
}

@InputType()
export class CustomerRelationshipContactInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  phone: string;

  @Field()
  @IsString()
  type: string;
}

@ObjectType()
export class CustomersTimeSeriesReport {
  @Field()
  total: number;

  @Field(() => [String])
  newIds: string[];
}

@ObjectType()
export class CustomersMetricsReport {
  @Field()
  newCustomersToday: number;
}

export interface CustomerEventData {
  code: string;
  name: string;
  assigneeUserIds: string[];
}

export type CustomerShortInfo = Pick<
  CustomerEntity,
  | 'code'
  | 'plainCode'
  | 'name'
  | 'phone'
  | 'email'
  | 'gender'
  | 'avatar'
  | 'tagIds'
  | 'createdAt'
  | 'workspaceBranchId'
  | 'workspaceId'
> & {
  _id: string;
};

export interface NotifyNewCustomerToZaloGmfGroup {
  customerId: string;
  workspaceId: string;
}
