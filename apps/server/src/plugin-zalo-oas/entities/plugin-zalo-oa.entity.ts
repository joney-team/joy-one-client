import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  PluginZaloOaStatus,
  PluginZaloZNSTemplateIds,
  PluginZaloZNSTemplateStatues,
  ZaloOaInfo,
} from '../plugin-zalo-oas.types';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';

@ObjectType('PluginZaloOa')
@Entity('plugin-zalo-oas')
@Unique('plugin-zalo-oas-unique', ['id'])
export class PluginZaloOaEntity extends BaseMongoEntity {
  @Field()
  @Column()
  id: string;

  @Column()
  refreshToken: string;

  @Column()
  accessToken: string;

  @Field()
  @Column()
  isDefault: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  znsTemplateIds?: PluginZaloZNSTemplateIds;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  znsTemplateStatues?: PluginZaloZNSTemplateStatues;

  @Field(() => PluginZaloOaStatus)
  @Column()
  status: PluginZaloOaStatus;

  @Field(() => ZaloOaInfo)
  @Column()
  info: ZaloOaInfo;

  @Field(() => Boolean, { nullable: true })
  @Column()
  isDisabled?: boolean;
}
