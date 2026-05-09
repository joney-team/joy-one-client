import { Field, ObjectType } from '@nestjs/graphql';
import { LocationEntity } from 'src/locations/locations.types';
import { Column, Entity, Unique } from 'typeorm';
import { BaseMongoEntity } from '../../database/database.entities';
import { AppLocale } from '../../lang/lang.types';
import { WorkspaceType } from '../workspaces.types';

@ObjectType('Workspace')
@Entity('workspaces')
@Unique('workspaces-unique', ['code'])
export class WorkspaceEntity extends BaseMongoEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => WorkspaceType)
  @Column()
  type: WorkspaceType;

  @Field()
  @Column()
  code: string;

  @Field({ nullable: true })
  @Column()
  logo?: string;

  @Column()
  logoVersion?: number;

  @Field(() => LocationEntity, { nullable: true })
  @Column()
  location?: LocationEntity;

  @Field({ nullable: true })
  @Column()
  hotline?: string;

  @Field({ nullable: true })
  @Column()
  phone?: string;

  @Column()
  businessPartnerUserId?: string;

  @Column()
  members?: any[];

  @Field({ nullable: true })
  @Column()
  inherit?: boolean;

  @Field({ nullable: true })
  @Column()
  appName?: string;

  @Field({ nullable: true })
  @Column()
  appIcon?: string;

  @Field({ nullable: true })
  @Column()
  appDomain?: string;

  @Field({ nullable: true })
  @Column()
  appColor?: string;

  @Field({ nullable: true })
  @Column()
  appColorShape?: number;

  @Field({ nullable: true })
  @Column()
  inviteCode?: string;

  @Field(() => AppLocale, { nullable: true })
  @Column()
  locale?: AppLocale;

  @Field({ nullable: true })
  @Column()
  cover?: string;

  @Field()
  @Column()
  branches: number;
}
