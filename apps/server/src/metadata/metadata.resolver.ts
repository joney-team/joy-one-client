import { Args, Query, Resolver } from '@nestjs/graphql';
import { renderFileLink } from 'src/files/files.utils';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { AppMetadata } from './metadata.types';

const defaultAppMetadata: AppMetadata = {
  name: 'JoyOne',
  color: 'primary',
  icon: '/favicon.ico',
  colorShape: null,
  workspaceId: null,
  isExtended: false,
};

@Resolver()
export class MetadataResolver {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Query(() => AppMetadata)
  async getAppMetadata(
    @Args('domain', { nullable: true }) domain: string | null,
  ): Promise<AppMetadata> {
    const workspace = domain ? await this.workspaces.getByDomain(domain) : null;

    if (workspace) {
      const workspaceIcon = workspace.appIcon || workspace.logo;

      return {
        name: workspace.appName || workspace.name || defaultAppMetadata.name,
        icon: workspaceIcon
          ? renderFileLink(workspaceIcon)
          : defaultAppMetadata.icon,
        color: workspace.appColor,
        colorShape: workspace.appColorShape,
        workspaceId: workspace._id.toString(),
        isExtended: true,
      };
    }

    return {
      name: 'JoyOne',
      color: 'primary',
      icon: '/favicon.ico',
      colorShape: null,
      workspaceId: null,
      isExtended: false,
    };
  }
}
