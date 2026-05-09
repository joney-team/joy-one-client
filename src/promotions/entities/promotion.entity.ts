import { Field, ObjectType } from '@nestjs/graphql';
import { BasePostgresEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { GraphQLJSONObject } from '../../graphql/graphql-type';
import { DynamicSelection } from '../../utils/dynamic-selection';
import { PromotionStatus, PromotionType } from '../promotions.types';

@ObjectType('Promotion')
@Entity('promotions')
export class PromotionEntity extends BasePostgresEntity {
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  description?: string;

  @Field({ nullable: true })
  @Column()
  image?: string;

  @Field({ nullable: true })
  @Column()
  limitPerCustomer?: number;

  @Field(() => PromotionType)
  @Column()
  type: PromotionType;

  @Field()
  @Column()
  value: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb' })
  productsSelection?: DynamicSelection;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: 'jsonb' })
  customersSelection?: DynamicSelection;

  @Field({ nullable: true })
  @Column()
  expireAt?: number;

  @Field(() => PromotionStatus)
  @Column()
  status: PromotionStatus;
}
