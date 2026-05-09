import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AppMetadata {
  @Field()
  name: string;

  @Field()
  icon: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  colorShape?: number;

  @Field({ nullable: true })
  workspaceId?: string;

  @Field()
  isExtended: boolean;
}
