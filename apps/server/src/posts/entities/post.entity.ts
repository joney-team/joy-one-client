import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { JSONContent } from '../posts.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from '../../graphql/graphql-type';

@ObjectType('Post')
@Entity('posts')
@Unique('posts-unique', ['slug'])
export class PostEntity extends BaseMongoEntity {
  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  slug: string;

  @Field({ nullable: true })
  @Column()
  excerpt?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  content?: JSONContent;

  @Field({ nullable: true })
  @Column()
  contentHtml?: string;

  @Field({ nullable: true })
  @Column()
  thumbnail?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  meta?: any;

  @Field({ nullable: true })
  @Column()
  publishedAt?: number;

  @Field({ nullable: true })
  @Column()
  categoryId?: string;

  @Field({ nullable: true })
  @Column()
  productId?: string;
}
