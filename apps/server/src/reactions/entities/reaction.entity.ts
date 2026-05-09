import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { ReactionType } from '../reactions.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { WorkspaceMemberPublicInfo } from '../../workspace-members/entities/workspace-member.entity';

@Entity('reactions')
@Unique('reactions-unique', ['ref'])
export class ReactionEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  userId: string;

  @Field(() => String)
  @Column()
  ref: string;

  @Field(() => String)
  @Column()
  entity: string;

  @Field(() => String)
  @Column()
  entityId: string;

  @Field(() => ReactionType)
  @Column()
  type: ReactionType;
}

@ObjectType('Reaction')
export class Reaction {
  @Field(() => String)
  userId: string;

  @Field(() => WorkspaceMemberPublicInfo)
  user: WorkspaceMemberPublicInfo;

  @Field(() => ReactionType)
  @Column()
  type: ReactionType;

  @Field(() => Number)
  @Column()
  createdAt: number;
}
