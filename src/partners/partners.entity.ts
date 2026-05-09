import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';

@ObjectType('Partner')
@Entity('partners')
export class PartnerEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  phone?: string;

  @Field(() => String, { nullable: true })
  @Column()
  logo?: string;

  @Field(() => String, { nullable: true })
  @Column()
  email?: string;
}
