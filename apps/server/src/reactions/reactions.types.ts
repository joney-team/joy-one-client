import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { DynamicPaginatedArgs } from '../database/database.utils';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  SURPRISE = 'surprise',
  EYES = 'EYES',
  ANGRY = 'angry',
  SAD = 'sad',
  DISLIKE = 'dislike',
}

registerEnumType(ReactionType, {
  name: 'ReactionType',
  description: 'Available reaction types',
});

@ArgsType()
export class AddReactionArgs {
  @Field(() => ReactionType)
  @IsEnum(ReactionType)
  type: ReactionType;

  @Field(() => String)
  @IsString()
  entity: string;

  @Field(() => String)
  @IsString()
  entityId: string;
}

@ArgsType()
export class RemoveReactionArgs {
  @Field(() => String)
  @IsString()
  entity: string;

  @Field(() => String)
  @IsString()
  entityId: string;

  @Field(() => ReactionType)
  @IsEnum(ReactionType)
  type: ReactionType;
}

@ArgsType()
export class GetEntityReactionsArgs {
  @Field(() => String)
  @IsString()
  entity: string;

  @Field(() => String)
  @IsString()
  entityId: string;
}

@ObjectType()
export class ReactionCount {
  @Field(() => ReactionType)
  type: ReactionType;

  @Field(() => Number)
  count: number;

  @Field(() => [String])
  @IsArray()
  userIds: string[];
}

@ObjectType()
export class ReactionsCount {
  @Field(() => [ReactionCount])
  @IsArray()
  reactions: ReactionCount[];
}

@ArgsType()
export class ReactionsPaginatedArgs extends DynamicPaginatedArgs {
  @Field(() => String)
  @IsString()
  entity: string;

  @Field(() => String)
  @IsString()
  entityId: string;
}
