import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { WorkspaceType } from '../../workspaces/workspaces.types';

@ObjectType()
export class WorkspaceStatWorkspaceInformation {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  appColor?: string;

  @Field(() => WorkspaceType)
  type: WorkspaceType;
}

@ObjectType('WorkspaceStat')
@Entity('workspace-stats')
@Unique('workspace-stats-unique', ['workspaceId'])
export class WorkspaceStatsEntity extends BaseMongoEntity {
  @Field()
  @Column()
  storageUsage: number;

  @Field()
  @Column()
  members: number;

  @Field()
  @Column()
  bookings: number;

  @Field()
  @Column()
  customers: number;

  @Field()
  @Column()
  orders: number;

  @Field()
  @Column()
  metaPages: number;

  @Field()
  @Column()
  zaloOas: number;

  @Field()
  @Column()
  messageHubs: number;

  @Field(() => WorkspaceStatWorkspaceInformation)
  workspace: WorkspaceStatWorkspaceInformation;
}
