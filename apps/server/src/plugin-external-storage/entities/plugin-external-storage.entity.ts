import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { PluginExternalStorageProvider } from '../plugin-external-storage.types';

@ObjectType('PluginExternalStorage')
@Entity('plugin-external-storages')
export class PluginExternalStorageEntity extends BaseMongoEntity {
  @Field(() => PluginExternalStorageProvider)
  @Column()
  provider: PluginExternalStorageProvider;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  accessKeyId?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  secretAccessKey?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  region?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  bucketName?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  endpointUrl?: string;

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true })
  size?: number;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  isDisabled?: boolean;
}
