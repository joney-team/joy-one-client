import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import {
  PluginAiAssistantStatus,
  PluginAiAssistantProvider,
} from '../plugin-ai-assistants.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PluginAiAssistant')
@Entity('plugin-ai-assistants')
export class PluginAiAssistantEntity extends BaseMongoEntity {
  @Field({ nullable: true })
  @Column()
  providerName?: string;

  @Field(() => PluginAiAssistantProvider)
  @Column()
  provider: PluginAiAssistantProvider;

  @Field()
  @Column()
  apiKey: string;

  @Column()
  workspaceId: string;

  @Field()
  @Column()
  enabled: boolean;

  @Field(() => PluginAiAssistantStatus)
  @Column()
  status: PluginAiAssistantStatus;
}
