import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { FileType } from './files.types';

@ObjectType()
@Entity('files')
export class FileEntity extends BaseMongoEntity {
  @Field(() => FileType)
  @Column()
  type: FileType;

  @Field(() => String)
  @Column({ nullable: false })
  fileName: string;

  @Field(() => String)
  @Column({ nullable: false })
  path: string;

  @Field(() => String, { nullable: true })
  @Column()
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  @Column()
  externalUrl?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: false })
  relativePath?: string;

  @Field(() => Number, { nullable: true })
  @Column({ nullable: false })
  size?: number;

  @Field(() => String, { nullable: true })
  @Column()
  ref?: string;

  @Field({ nullable: true })
  @Column()
  uploadByUserId?: string;

  // Temp files
  @Column()
  isTemp?: boolean;

  @Column()
  tempSession?: string;
}

@ObjectType()
export class File extends FileEntity {
  @Field()
  url: string;
}
