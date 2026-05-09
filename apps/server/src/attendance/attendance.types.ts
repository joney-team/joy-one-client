import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Coordinates, CoordinatesInput } from '../locations/locations.types';

export enum AttendanceRecordType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

registerEnumType(AttendanceRecordType, {
  name: 'AttendanceRecordType',
  description: 'Attendance record type',
});

@ObjectType()
export class AttendanceRecordLocation {
  @Field()
  name: string;

  @Field(() => Coordinates)
  coordinates: Coordinates;
}

export enum AttendanceRecordMethod {
  DEFAULT = 'DEFAULT',
  MANUAL = 'MANUAL',
}

registerEnumType(AttendanceRecordMethod, {
  name: 'AttendanceRecordMethod',
  description: 'Attendance record method',
});

export enum AttendanceRecordStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(AttendanceRecordStatus, {
  name: 'AttendanceRecordStatus',
  description: 'Attendance record status',
});

@ObjectType()
export class AttendanceSettingLocation {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  allowedDistanceInMeters: number;

  @Field(() => Coordinates)
  coordinates?: Coordinates;
}

@InputType()
export class AttendanceSettingLocationInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsNumber()
  allowedDistanceInMeters: number;

  @Field(() => CoordinatesInput)
  @ValidateNested()
  @Type(() => CoordinatesInput)
  coordinates: CoordinatesInput;
}

@InputType()
export class UpdateAttendanceSettingInput {
  @Field(() => [AttendanceSettingLocationInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => AttendanceSettingLocationInput)
  @IsOptional()
  locations?: AttendanceSettingLocationInput[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  allowedDistanceInMeters?: number;
}
