import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { AppEntity } from '../app.types';
import { GraphQLJSONObject } from '../graphql/graphql-type';
import { CustomFieldType } from './custom-fields.types';

@ObjectType('CustomField')
@Entity('custom-fields')
export class CustomFieldEntity extends BaseMongoEntity {
  @Field(() => CustomFieldType)
  @Column()
  type: CustomFieldType;

  @Field({ nullable: true })
  @Column()
  key?: string;

  @Field(() => String)
  @Column()
  label: string;

  @Field()
  @Column({ default: 0 })
  order: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  config?: any;

  @Field({ nullable: true })
  @Column()
  description?: string;

  @Field({ nullable: true })
  @Column()
  placeholder?: string;

  @Field(() => [String])
  @Column()
  entities: AppEntity[];
}
