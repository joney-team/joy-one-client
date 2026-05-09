import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { BaseMongoEntity } from '../../database/database.entities';
import { GraphQLJSONObject } from '../../graphql/graphql-type';
import { PluginEInvoicesProviderType } from '../plugin-e-invoices.types';

@ObjectType('EInvoice')
@Entity('plugin-e-invoices')
export class PluginEInvoicesEntity extends BaseMongoEntity {
  @Field()
  @Column()
  providerId: string;

  @Field(() => PluginEInvoicesProviderType)
  @Column()
  provider: PluginEInvoicesProviderType;

  @Field()
  @Column()
  receiptId: string;

  @Field()
  @Column()
  receiptCode: string;

  @Field()
  @Column()
  invoiceId: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  invoiceData: Record<string, unknown>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column()
  providerData: Record<string, unknown>;

  @Field({ nullable: true })
  @Column()
  url?: string;

  @Field({ nullable: true })
  @Column()
  isCancelled?: boolean;
}
