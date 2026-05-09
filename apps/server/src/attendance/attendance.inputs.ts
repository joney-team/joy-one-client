import { Field, InputType } from '@nestjs/graphql';
import { CoordinatesInput } from '../locations/locations.types';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AttendanceRecordType } from './attendance.types';

@InputType()
export class RecordAttendanceInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsObject()
  @IsOptional()
  locationCoordinates?: CoordinatesInput;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;
}

@InputType()
export class RequestRecordAttendanceInput {
  @Field(() => AttendanceRecordType)
  @IsEnum(AttendanceRecordType)
  type: AttendanceRecordType;

  @Field()
  @IsString()
  time: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsObject()
  @IsOptional()
  locationCoordinates?: CoordinatesInput;
}

@InputType()
export class DefaultRecordAttendanceInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  photoUrl: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsObject()
  @IsOptional()
  locationCoordinates?: CoordinatesInput;
}

@InputType()
export class RejectAttendanceRecordInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;
}
