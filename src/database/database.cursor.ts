import { Column, Entity, Unique } from 'typeorm';
import { BasePostgresEntity } from './database.entities';

@Entity('cursor')
@Unique('cursor-unique', ['ref'])
export class CursorEntity extends BasePostgresEntity {
  @Column()
  ref: string;

  @Column({ nullable: true })
  count: number | null;

  @Column({ nullable: true })
  pointer: string | null;
}
