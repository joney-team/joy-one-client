import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { WorkspacePermission } from '../workspace-roles.types';
import { IsArray, IsString } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('workspace-roles')
export class WorkspaceRoleEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  color?: string;

  @Field(() => String, { nullable: true })
  @Column()
  description?: string;

  @Field(() => [String])
  @Column()
  @IsArray()
  @IsString({ each: true })
  permissions: WorkspacePermission[];
}

@ObjectType('WorkspaceRole')
export class WorkspaceRole {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  permissions: WorkspacePermission[];

  @Field(() => Boolean)
  isEditable: boolean;
}
