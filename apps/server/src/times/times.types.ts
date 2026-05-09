import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TimeZone {
  @Field()
  id: string;

  @Field()
  value: string;

  @Field()
  abbr: string;

  @Field()
  offset: number;

  @Field()
  text: string;

  @Field(() => [String])
  utc: string[];
}
