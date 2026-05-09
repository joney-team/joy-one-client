import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { PrescriptionItem } from '../prescriptions.types';

@ObjectType('Prescription')
@Entity('prescriptions')
export class PrescriptionEntity extends BaseMongoEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => [PrescriptionItem])
  @Column()
  items: PrescriptionItem[];

  @Field({ nullable: true })
  @Column()
  note?: string;
}
