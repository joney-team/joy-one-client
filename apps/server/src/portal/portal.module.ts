import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { SearchModule } from '../search/search.module';

@Module({
  controllers: [PortalController],
  imports: [
    SearchModule,
  ]
})
export class PortalModule { }
