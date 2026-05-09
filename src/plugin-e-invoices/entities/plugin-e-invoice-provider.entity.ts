import { Column, Entity } from 'typeorm';
import { BaseMongoEntity } from '../../database/database.entities';
import {
  PluginEInvoicesProviderType,
  PluginEInvoiceProviderStatus,
  PluginEInvoiceTemplates,
} from '../plugin-e-invoices.types';
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';

@ObjectType('PluginEInvoiceProvider')
@Entity('plugin-e-invoices-providers')
export class PluginEInvoiceProviderEntity extends BaseMongoEntity {
  @Field(() => PluginEInvoicesProviderType)
  @Column()
  type: PluginEInvoicesProviderType;

  @Column()
  auth: string;

  @Field({ nullable: true })
  @Column()
  apiUrl?: string;

  @Field(() => PluginEInvoiceProviderStatus)
  @Column()
  status: PluginEInvoiceProviderStatus;

  @Field(() => GraphQLJSONObject)
  @Column()
  templates: PluginEInvoiceTemplates;
}
