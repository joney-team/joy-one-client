import { Module } from '@nestjs/common';
import { MetadataResolver } from './metadata.resolver';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  providers: [MetadataResolver],
  imports: [WorkspacesModule],
})
export class MetadataModule {}
