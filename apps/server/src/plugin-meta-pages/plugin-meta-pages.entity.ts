import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  MetaPageCategory,
  PluginMetaPageStatus,
} from './plugin-meta-pages.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('MetaPage')
@Entity('plugin-meta-pages')
@Unique('plugin-meta-pages-unique', ['id'])
export class PluginMetaPageEntity extends BaseMongoEntity {
  @Field()
  @Column()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  logo?: string;

  @Column()
  accessToken: string;

  @Field(() => [String], { nullable: true })
  @Column()
  tasks?: string[];

  @Field({ nullable: true })
  @Column()
  category?: string;

  @Field(() => [MetaPageCategory], { nullable: true })
  @Column()
  categories?: MetaPageCategory[];

  @Field(() => PluginMetaPageStatus)
  @Column()
  status: PluginMetaPageStatus;

  @Field({ nullable: true })
  @Column()
  isDisabled?: boolean;
}
