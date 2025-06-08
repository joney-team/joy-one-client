import { AppPageMetadata } from '@/types';
import { translateServer } from '@/modules/lang/lang-server-service';
import { MainServerRequest } from '@/modules/requests/main.server-request';
import { combineMetadata } from '@/utils/metadata.utils';

export const tasksMetadata = combineMetadata({
  fetch: async ({ params, locale }) => {
    if (params.code) {
      return MainServerRequest.get<AppPageMetadata>(`/tasks/metadata/${params.code}`);
    }

    if (!params.slug || params.slug === 'd') {
      const title = await translateServer('tasks', { locale })

      return {
        title,
      }
    }

    return MainServerRequest.get<AppPageMetadata>(`/tags/metadata/${params.slug}`);
  }
});