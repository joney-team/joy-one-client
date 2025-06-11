import { apiServerSide } from '@/modules/apis/server';
import { translateServer } from '@/modules/lang/lang-server-service';
import { AppPageMetadata } from '@/types';
import { combineMetadata } from '@/utils/metadata.utils';

export const tasksMetadata = combineMetadata({
  fetch: async ({ params, locale }) => {
    if (params.code) {
      return apiServerSide.get<AppPageMetadata>(`/tasks/metadata/${params.code}`);
    }

    if (!params.slug || params.slug === 'd') {
      const title = await translateServer('tasks', { locale })

      return {
        title,
      }
    }

    return apiServerSide.get<AppPageMetadata>(`/tags/metadata/${params.slug}`);
  }
});