import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { GraphQLAnyType } from 'src/graphql/graphql-type';
import { Column, Entity, Unique } from 'typeorm';
import { ReportStatus, ReportType } from '../reports.types';

@ObjectType('Report')
@Entity('reports')
@Unique('reports-unique', ['ref'])
export class ReportEntity<T extends any> extends BaseMongoEntity {
  @Field(() => ReportType)
  @Column()
  type: ReportType;

  @Field()
  @Column()
  ref: string;

  @Column()
  workspaceId: string;

  @Field()
  @Column()
  fromTime: number;

  @Field()
  @Column()
  toTime: number;

  @Field(() => [String], { nullable: true })
  @Column()
  workspaceBranchIds?: string[];

  @Field({ nullable: true })
  @Column()
  userId?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @Column('json')
  data: T;

  @Field(() => GraphQLAnyType, { nullable: true })
  @Column('json')
  dto: any;

  @Field(() => ReportStatus)
  @Column()
  status: ReportStatus;
}

export function ReportResponseType<T>(classRef: Type<T>): Type<T> {
  @ObjectType({ isAbstract: true })
  abstract class Report {
    @Field()
    _id: string;

    @Field(() => ReportType)
    @Column()
    type: ReportType;

    @Field()
    @Column()
    ref: string;

    @Column()
    workspaceId: string;

    @Field()
    @Column()
    fromTime: number;

    @Field()
    @Column()
    toTime: number;

    @Field(() => [String], { nullable: true })
    @Column()
    workspaceBranchIds?: string[];

    @Field({ nullable: true })
    @Column()
    userId?: string;

    @Field(() => classRef)
    @Column('json')
    data: T;

    @Field(() => GraphQLAnyType, { nullable: true })
    @Column('json')
    dto: any;

    @Field(() => ReportStatus)
    @Column()
    status: ReportStatus;

    @Field({ nullable: true })
    updatedAt?: number;
  }

  return Report as Type<T>;
}
