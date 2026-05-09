import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { CategoryType } from '../categories.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { CustomFieldEntity } from '../../custom-fields/custom-fields.entity';

@ObjectType('Category')
@Entity('categories')
@Unique('categories-unique', ['slug'])
export class CategoryEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  slug: string;

  @Field(() => String, { nullable: true })
  @Column()
  icon?: string;

  @Field(() => String, { nullable: true })
  @Column()
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  @Column()
  description?: string;

  @Field(() => String, { nullable: true })
  @Column()
  parentId?: string;

  @Field(() => Number)
  @Column()
  order: number;

  @Field(() => CategoryType)
  @Column({ default: CategoryType.COMMON })
  type: CategoryType;

  @Field(() => [CustomFieldEntity], { nullable: true })
  customFields: CustomFieldEntity[];
}
