import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { WorkspaceMemberPublicInfo } from '../../workspace-members/entities/workspace-member.entity';

@ObjectType('WorkspaceApiApp')
@Entity('workspace-api-apps')
export class WorkspaceApiAppEntity extends BaseMongoEntity {
  @Field()
  @Column()
  memberId: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  secretKey: string;

  @Field()
  @Column()
  enabled: boolean;

  @Field()
  @Column()
  authVersion: number;

  @Field(() => WorkspaceMemberPublicInfo)
  member: WorkspaceMemberPublicInfo;
}
