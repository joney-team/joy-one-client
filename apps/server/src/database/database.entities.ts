import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Generated,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppEntity, EntitySource } from '../app.types';
import {
  BaseCustomFieldValue,
  CustomFieldValue,
} from '../custom-fields/custom-fields.types';
import { GraphQLJSONObject } from '../graphql/graphql-type';
import { DateTime } from '../utils/date-time';
import { ObjectColumn } from './database.utils';

@ObjectType()
export class BaseEntity {
  @Column({ nullable: true })
  workspaceId?: string;

  @Column({ nullable: true, default: null })
  workspaceBranchId?: string;

  @Column({ nullable: true })
  createdByUserId?: string;

  @Column({ type: 'simple-array', nullable: true })
  assigneeUserIds?: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  refs?: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  createdAt?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  updatedAt?: number;

  @Column({ nullable: true })
  lastInteractionAt?: number;

  @Field({ nullable: true })
  @Column({ default: false })
  isArchived?: boolean;

  @Field(() => EntitySource, { nullable: true })
  @Column({ nullable: true })
  source?: EntitySource;

  @Column({ nullable: true })
  migrated?: number;

  @BeforeInsert()
  updateTimestampsOnInsert() {
    const now = DateTime.getNowInSeconds();
    this.createdAt = this.createdAt ?? now;
    this.lastInteractionAt = this.lastInteractionAt ?? now;
  }

  @BeforeUpdate()
  updateTimestampOnUpdate() {
    const now = DateTime.getNowInSeconds();
    this.updatedAt = now;
    this.lastInteractionAt = now;
  }
}

@ObjectType()
export class RelatedEntity {
  @Field(() => String)
  entity: AppEntity;

  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data?: Record<string, unknown>;

  @Field(() => Boolean, { nullable: true })
  index?: boolean;
}

@InputType()
export class RelatedEntityInput {
  @Field(() => String)
  @IsEnum(AppEntity)
  entity: AppEntity;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  index?: boolean;
}

@ObjectType()
export class BaseMongoEntity extends BaseEntity {
  @Field(() => String)
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true })
  relatedEntities?: RelatedEntity[];

  @Field(() => [CustomFieldValue], { nullable: true })
  @Column({ nullable: true })
  customFieldValues?: BaseCustomFieldValue[];
}

@ObjectType()
export class BasePostgresEntity extends BaseEntity {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('increment')
  _count: number;

  @Column({ nullable: true })
  _id?: string;

  @Field(() => [RelatedEntity], { nullable: true })
  @ObjectColumn({ nullable: true })
  relatedEntities?: RelatedEntity[];

  @Column({ type: 'simple-array', nullable: true })
  customFieldValues?: BaseCustomFieldValue[];
}
