import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { AppLocale } from '../../lang/lang.types';
import { GraphQLJSONObject } from '../../graphql/graphql-type';
import { FileExportContextType, FileExportStatus } from '../file-exports.types';

@ObjectType('FileExport')
@Entity('file-exports')
export class FileExportEntity extends BaseMongoEntity {
  @Field(() => String)
  @ObjectIdColumn()
  _id: ObjectId;

  @Field()
  @Column()
  workspaceId: string;

  @Field()
  @Column()
  userId: string;

  @Field(() => FileExportContextType)
  @Column()
  contextType: FileExportContextType;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column('json')
  contextArgs: Record<string, any>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fileName?: string;

  @Field(() => AppLocale, { nullable: true })
  @Column({ nullable: true })
  locale?: AppLocale;

  @Field(() => FileExportStatus)
  @Column()
  status: FileExportStatus;

  @Column({ nullable: true })
  fileRelativePath?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  error?: string;
}
