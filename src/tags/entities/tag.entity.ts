import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { TagType } from '../tags.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Tag')
@Entity('tags')
export class TagEntity extends BaseMongoEntity {
  @Field(() => TagType)
  @Column()
  type: TagType;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  slug: string;

  @Field(() => Number)
  @Column()
  order: number;

  @Field(() => String, { nullable: true })
  @Column()
  color?: string;
}
