import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { CustomerContact } from '../customer-contacts.types';

@ObjectType('CustomerContact')
@Entity('customer-contacts')
@Unique('customer-contacts-unique', ['customerId'])
export class CustomerContactEntity extends BaseMongoEntity {
  @Field()
  @Column()
  customerId: string;

  @Field(() => [CustomerContact])
  @Column()
  contacts: CustomerContact[];
}
