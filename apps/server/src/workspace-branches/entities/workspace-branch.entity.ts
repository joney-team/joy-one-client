import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { LocationEntity } from '../../locations/locations.types';
import { WorkspaceBranchSettings } from '../workspace-branches.types';

@ObjectType('WorkspaceBranch')
@Entity('workspace-branches')
export class WorkspaceBranchEntity extends BaseMongoEntity {
  @Column()
  workspaceId: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column()
  hotline?: string;

  @Field(() => LocationEntity)
  @Column()
  location?: LocationEntity;

  @Field(() => WorkspaceBranchSettings, { nullable: true })
  @Column()
  settings?: WorkspaceBranchSettings;
}
