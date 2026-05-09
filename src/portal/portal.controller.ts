import { Controller, Get, Query } from '@nestjs/common';
import { Portal, Workspace } from '../app.decorators';
import { renderPrevVnLocation } from '../locations/locations.utils';
import { SearchService } from '../search/search.service';
import { SearchQuery } from '../search/search.types';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';

@Controller('portal')
export class PortalController {
  constructor(private readonly search: SearchService) {}

  @Get('/workspace')
  @Portal({ requireWorkspace: true })
  async workspace(@Workspace() workspace: WorkspaceEntity) {
    return {
      ...workspace,
      locationOrigin: renderPrevVnLocation(workspace.location),
    };
  }

  @Get('/search')
  @Portal({ requireWorkspace: true })
  async workspaceSearch(
    @Query() query: SearchQuery,
    @Workspace() workspace: WorkspaceEntity,
  ) {
    return this.search.search({ workspace, ...query });
  }
}
