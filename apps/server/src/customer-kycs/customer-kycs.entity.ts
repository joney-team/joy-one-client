import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { CustomerKycStatus, CustomerKycVersion } from './customer-kycs.types';

@ObjectType('CustomerKyc')
@Entity('customer-kycs')
@Unique('customer-kycs-unique', ['customerId'])
export class CustomerKycEntity extends BaseMongoEntity {
  @Field()
  @Column()
  customerId: string;

  @Field({ nullable: true })
  @Column()
  cidNumber?: string;

  @Field(() => [CustomerKycVersion])
  @Column()
  versions: CustomerKycVersion[];

  @Field(() => CustomerKycStatus)
  @Column()
  status: CustomerKycStatus;
}
