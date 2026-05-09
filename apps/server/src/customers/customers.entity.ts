import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { LocationEntity } from 'src/locations/locations.types';
import { Column, Entity, Unique } from 'typeorm';
import { Gender } from '../app.types';
import { CustomerRelationshipContact } from './customers.types';

@ObjectType('Customer')
@Entity('customers')
@Unique('customers-unique', ['code'])
export class CustomerEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  code: string;

  @Field(() => String, { nullable: true })
  @Column()
  codePrefix?: string;

  @Field(() => String, { nullable: true })
  @Column()
  plainCode?: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Number, { nullable: true })
  @Column()
  birthday?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  birthdayDate?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  birthdayMonth?: number;

  @Field(() => String, { nullable: true })
  @Column()
  phone?: string;

  @Field(() => String, { nullable: true })
  @Column()
  avatar?: string;

  @Field(() => String, { nullable: true })
  @Column()
  email?: string;

  @Field(() => LocationEntity, { nullable: true })
  @Column()
  location?: LocationEntity;

  @Field(() => LocationEntity, { nullable: true })
  @Column()
  vnLocation?: LocationEntity;

  @Field(() => LocationEntity, { nullable: true })
  @Column()
  vnSecondaryLocation?: LocationEntity;

  @Field(() => LocationEntity, { nullable: true })
  @Column()
  secondaryLocation?: LocationEntity;

  @Field(() => String, { nullable: true })
  @Column()
  presenterCustomerId?: string;

  @Field(() => Gender, { nullable: true })
  @Column()
  gender?: Gender;

  @Field(() => [String], { nullable: true })
  @Column()
  medicalHistory: string[];

  @Field(() => [String], { nullable: true })
  @Column()
  assigneeUserIds: string[];

  @Field(() => [String], { nullable: true })
  @Column()
  tagIds: string[];

  @Field(() => Number, { nullable: true })
  @Column()
  salaryAmount?: number;

  @Field(() => [String], { nullable: true })
  @Column()
  relatedCustomerIds?: string[];

  @Field(() => [CustomerRelationshipContact], { nullable: true })
  @Column()
  relationshipContacts?: CustomerRelationshipContact[];

  @Column()
  @Field({ nullable: true })
  lastCheckin: number;

  @Field({ nullable: true })
  @Column()
  socialFacebookUrl?: string;

  @Column()
  deviceIds?: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  createdAt?: number;
}
