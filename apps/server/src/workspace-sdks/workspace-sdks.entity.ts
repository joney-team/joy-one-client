import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';

@Entity('workspace-sdks')
export class WorkspaceSdkEntity extends BaseMongoEntity {
  @Column()
  workspaceId: string;

  @Column()
  name: string;

  @Column()
  key: string;
}
