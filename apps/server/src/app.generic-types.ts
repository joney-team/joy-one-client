import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class Interval {
  @Field({ description: 'Format: HH:mm' })
  start: string;

  @Field({ description: 'Format: HH:mm' })
  end: string;
}

@InputType()
export class IntervalInput {
  @Field({ description: 'Format: HH:mm' })
  @IsString()
  start: string;

  @Field({ description: 'Format: HH:mm' })
  @IsString()
  end: string;
}

@ObjectType()
export class WorkingDayInterval extends Interval {
  @Field()
  id: string;

  @Field({
    description:
      '1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday',
  })
  day: number;

  @Field({ nullable: true })
  shift?: string;
}

@InputType()
export class WorkingDayIntervalInput extends IntervalInput {
  @Field()
  @IsString()
  id: string;

  @Field({
    description:
      '1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday',
  })
  @IsNumber()
  day: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  shift?: string;
}
