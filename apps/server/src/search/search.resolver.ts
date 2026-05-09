import { Args, Query, Resolver } from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import { getEntityId } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  SearchArgs,
  SearchResult,
  searchResultTypes,
} from './search.graphql-types';
import { SearchService } from './search.service';

@Resolver()
export class SearchResolver {
  constructor(private readonly service: SearchService) {}

  @Query(() => [SearchResult])
  @Auth({ member: true })
  async search(@Args() args: SearchArgs, @Member() member: WorkspaceMember) {
    const result = await this.service.search({
      member,
      q: args.query,
      limit: args.limit ?? 5,
      entities: args.entities,
      filter: args.filter,
    });

    const output = Object.entries(result).reduce((out, [entity, items]) => {
      out.push(
        ...items.map((item) => ({
          ...item,
          id: getEntityId(item),
          entity,
        })),
      );
      return out;
    }, []);

    return output;
  }

  @Query(() => [String])
  async availableSearchEntities() {
    return Object.keys(searchResultTypes);
  }
}
