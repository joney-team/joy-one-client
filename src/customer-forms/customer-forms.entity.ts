import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { CustomerFormStatus } from './customer-forms.types';
import { LocationEntity } from '../locations/locations.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLAnyType } from '../graphql/graphql-type';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';

@ObjectType('CustomerForm')
@Entity('customer-forms')
export class CustomerFormEntity extends BaseMongoEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  phone: string;

  @Field({ nullable: true })
  @Column()
  email?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @Column('json')
  dynamicData?: any;

  @Field(() => LocationEntity, { nullable: true })
  @Column('json')
  location?: LocationEntity;

  @Field(() => LocationEntity, { nullable: true })
  @Column()
  vnLocation?: LocationEntity;

  @Field(() => CustomerFormStatus)
  @Column()
  status: CustomerFormStatus;

  @Field({ nullable: true })
  @Column()
  cancelReason?: string;

  @Field(() => WorkspaceBranchEntity, { nullable: true })
  workspaceBranch?: WorkspaceBranchEntity;
}
