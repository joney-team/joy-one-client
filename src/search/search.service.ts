import { Client } from '@elastic/elasticsearch';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, Not, Repository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CategoryEntity } from '../categories/entities/category.entity';
import { configs } from '../config/config';
import { CustomerEntity } from '../customers/customers.entity';
import { CustomerShortInfo } from '../customers/customers.types';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId } from '../database/database.utils';
import { LoanEntity } from '../loans/entities/loan.entity';
import { MessageBoxEntity } from '../message-boxes/entities/message-box.entity';
import { MessageEntity } from '../message-boxes/entities/message.entity';
import { OrderEntity } from '../orders/orders.entity';
import { PartnerEntity } from '../partners/partners.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { PrescriptionEntity } from '../prescriptions/entities/prescription.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';
import {
  getKeyOfEnum,
  ObjectUtils,
  selectProperties,
} from '../utils/object.utils';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceMemberEntity } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import {
  CustomerSearchResult,
  SearchEntity,
  SearchEntityQuery,
  SearchEntityResult,
  SearchIndexInput,
  SearchIndexStatus,
  SearchQuery,
  SearchResult,
} from './search.types';
import { cleanDocument } from './search.utils';
import { QueryDslQueryContainer } from 'node_modules/@elastic/elasticsearch/lib/api/types';

@Injectable()
export class SearchService {
  private client = new Client({ node: configs.ELASTICSEARCH_URL });

  constructor(
    // Repositories
    @InjectRepository(CustomerEntity, DatabaseName.MONGO)
    private customersRepository: MongoRepository<CustomerEntity>,
    @InjectRepository(TaskEntity, DatabaseName.MONGO)
    private tasksRepository: MongoRepository<TaskEntity>,
    @InjectRepository(LoanEntity, DatabaseName.POSTGRES)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(ReceiptEntity, DatabaseName.POSTGRES)
    private receiptsRepository: Repository<ReceiptEntity>,
    @InjectRepository(OrderEntity, DatabaseName.POSTGRES)
    private ordersRepository: Repository<OrderEntity>,
    @InjectRepository(PartnerEntity, DatabaseName.MONGO)
    private partnersRepository: MongoRepository<PartnerEntity>,
    @InjectRepository(TagEntity, DatabaseName.MONGO)
    private tagsRepository: MongoRepository<TagEntity>,
    @InjectRepository(ProductEntity, DatabaseName.MONGO)
    private productsRepository: MongoRepository<ProductEntity>,
    @InjectRepository(PrescriptionEntity, DatabaseName.MONGO)
    private prescriptionsRepository: MongoRepository<PrescriptionEntity>,
    @InjectRepository(WorkspaceMemberEntity, DatabaseName.MONGO)
    private workspaceMembersRepository: MongoRepository<WorkspaceMemberEntity>,
    @InjectRepository(WorkspaceBranchEntity, DatabaseName.MONGO)
    private workspaceBranchesRepository: MongoRepository<WorkspaceBranchEntity>,
    @InjectRepository(UserEntity, DatabaseName.MONGO)
    private usersRepository: MongoRepository<UserEntity>,
    @InjectRepository(MessageBoxEntity, DatabaseName.MONGO)
    private messageBoxesRepository: MongoRepository<MessageBoxEntity>,
    @InjectRepository(MessageEntity, DatabaseName.MONGO)
    private messagesRepository: MongoRepository<MessageEntity>,
    @InjectRepository(PostEntity, DatabaseName.MONGO)
    private postsRepository: MongoRepository<PostEntity>,
    @InjectRepository(CategoryEntity, DatabaseName.MONGO)
    private categoriesRepository: MongoRepository<CategoryEntity>,

    // Services
    private workspaceMembers: WorkspaceMembersService,
    private queueProducers: QueueProducersService,
  ) {}

  async onModuleInit() {
    try {
      await this.client.ping();
    } catch (error) {
      logger.error(error, { case: 'Elasticsearch connection failed' });
    }
  }

  entityConfigs: {
    [AppEntity.CUSTOMERS]: SearchEntity<CustomerEntity>;
    [AppEntity.TASKS]: SearchEntity<TaskEntity>;
    [AppEntity.PRODUCTS]: SearchEntity<ProductEntity>;
    [AppEntity.LOANS]: SearchEntity<LoanEntity>;
    [AppEntity.RECEIPTS]: SearchEntity<ReceiptEntity>;
    [AppEntity.PARTNERS]: SearchEntity<PartnerEntity>;
    [AppEntity.PRESCRIPTIONS]: SearchEntity<PrescriptionEntity>;
    [AppEntity.TAGS]: SearchEntity<TagEntity>;
    [AppEntity.ORDERS]: SearchEntity<OrderEntity>;
    [AppEntity.WORKSPACE_MEMBERS]: SearchEntity<WorkspaceMemberEntity>;
    [AppEntity.USERS]: SearchEntity<UserEntity>;
    [AppEntity.WORKSPACE_BRANCHES]: SearchEntity<WorkspaceBranchEntity>;
    [AppEntity.MESSAGE_BOXES]: SearchEntity<MessageBoxEntity>;
    [AppEntity.MESSAGES]: SearchEntity<MessageEntity>;
    [AppEntity.POSTS]: SearchEntity<PostEntity>;
    [AppEntity.CATEGORIES]: SearchEntity<CategoryEntity>;
  } = {
    [AppEntity.CUSTOMERS]: {
      repository: this.customersRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        plainCode: {
          type: 'keyword',
        },
        code: {
          type: 'keyword',
        },
        email: {
          type: 'keyword',
        },
        phone: {
          type: 'keyword',
        },
      },
      bindData: (e): CustomerShortInfo => ({
        _id: e._id.toString(),
        name: e.name,
        phone: e.phone,
        email: e.email,
        avatar: e.avatar,
        code: e.code,
        plainCode: e.plainCode,
        tagIds: e.tagIds,
        createdAt: e.createdAt,
        workspaceId: e.workspaceId,
        workspaceBranchId: e.workspaceBranchId,
      }),
    },
    [AppEntity.TASKS]: {
      repository: this.tasksRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        description: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        code: {
          type: 'keyword',
        },
      },
    },
    [AppEntity.PRODUCTS]: {
      repository: this.productsRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        type: {
          type: 'keyword',
        },
        code: {
          type: 'keyword',
        },
      },
      bindData: (e) =>
        selectProperties(e, [
          'categoryId',
          'image',
          'displayName',
          'maxPrice',
          'minPrice',
          'price',
          'type',
          'unit',
          'isHiddenInReceiptWhenNoPrice',
        ]),
    },
    [AppEntity.LOANS]: {
      repository: this.loansRepository,
      properties: {
        customerName: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        customerPhone: {
          type: 'keyword',
        },
        customerCidNumber: {
          type: 'keyword',
        },
        code: {
          type: 'keyword',
        },
        imeil: {
          type: 'keyword',
        },
      },
      bindData: async (e) => {
        const imeil = ObjectUtils.getIn(e.assetData, 'imeil', null);
        const customer = await this.customersRepository.findOne({
          where: { _id: mustBeObjectId(e.customerId) },
        });

        return {
          ...selectProperties(e, [
            'amount',
            'assetType',
            'package',
            'status',
            'customerCidNumber',
          ]),
          imeil,
          customerName: customer?.name,
          customerPhone: customer?.phone,
        };
      },
    },
    [AppEntity.RECEIPTS]: {
      repository: this.receiptsRepository,
      properties: {
        code: {
          type: 'keyword',
        },
      },
      bindData: (e) => selectProperties(e, ['amount', 'type']),
    },
    [AppEntity.PARTNERS]: {
      repository: this.partnersRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        phone: {
          type: 'keyword',
        },
        email: {
          type: 'keyword',
        },
      },
      selectAllFields: true,
    },
    [AppEntity.PRESCRIPTIONS]: {
      repository: this.prescriptionsRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        note: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
      },
    },
    [AppEntity.TAGS]: {
      repository: this.tagsRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        type: {
          type: 'keyword',
        },
      },
      selectAllFields: true,
    },
    [AppEntity.ORDERS]: {
      repository: this.ordersRepository,
      properties: {
        code: {
          type: 'keyword',
        },
      },
    },
    [AppEntity.WORKSPACE_MEMBERS]: {
      repository: this.workspaceMembersRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        email: {
          type: 'keyword',
        },
        phone: {
          type: 'keyword',
        },
      },
      bindData: async (member) => this.workspaceMembers.getMemberInfo(member),
    },
    [AppEntity.USERS]: {
      repository: this.usersRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        email: {
          type: 'keyword',
        },
        phone: {
          type: 'keyword',
        },
      },
    },
    [AppEntity.WORKSPACE_BRANCHES]: {
      repository: this.workspaceBranchesRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        hotline: {
          type: 'keyword',
        },
      },
      selectAllFields: true,
    },
    [AppEntity.MESSAGE_BOXES]: {
      repository: this.messageBoxesRepository,
      properties: {
        senderName: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
      },
      selectAllFields: true,
    },
    [AppEntity.MESSAGES]: {
      repository: this.messagesRepository,
      properties: {
        content: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
      },
      selectAllFields: true,
    },
    [AppEntity.POSTS]: {
      repository: this.postsRepository,
      properties: {
        title: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        excerpt: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
      },
      bindData: async (e) => selectProperties(e, ['thumbnail']),
    },
    [AppEntity.CATEGORIES]: {
      repository: this.categoriesRepository,
      properties: {
        name: {
          type: 'text',
          analyzer: 'icu_analyzer',
        },
        type: {
          type: 'keyword',
        },
      },
      selectAllFields: true,
    },
  };

  getIndex(entity: AppEntity) {
    return `${configs.ENV}-${getKeyOfEnum(AppEntity, entity)}`.toLowerCase();
  }

  getAvailableEntities() {
    return Object.values(AppEntity).reduce((output, e) => {
      const entityConfig = this.entityConfigs[e];
      if (entityConfig) output.push(e);
      return output;
    }, []);
  }

  async index(
    dto: SearchIndexInput,
  ): Promise<{ status: SearchIndexStatus; document?: any; _doc?: any }> {
    try {
      const entityConfig = this.entityConfigs[dto.entity] as SearchEntity<any>;
      if (!entityConfig)
        return { status: SearchIndexStatus.ENTITY_NOT_SUPPORTED };
      if (!dto.id)
        return { status: SearchIndexStatus.ENTITY_ID_MUST_BE_PROVIDED };

      const index = this.getIndex(dto.entity);
      const docId = dto.id;

      // Find document
      const doc = await entityConfig.repository.findOne({
        where:
          entityConfig.repository instanceof MongoRepository
            ? { _id: mustBeObjectId(docId) }
            : { id: docId },
      });

      if (!doc) {
        await this.client.delete({ index, id: docId }).catch(() => false);
        return { status: SearchIndexStatus.ENTITY_DOC_NOT_FOUND };
      } else if (doc.isArchived === true) {
        await this.client.delete({ index, id: docId }).catch(() => false);
        return { status: SearchIndexStatus.ENTITY_DOC_ARCHIVED };
      } else {
        // Index document
        const bindData = entityConfig.bindData
          ? await entityConfig.bindData(doc)
          : {};
        const document = cleanDocument({
          id: docId,
          ...(entityConfig.selectAllFields
            ? doc
            : selectProperties(doc, [
                ...Object.keys(entityConfig.properties),
                'workspaceId',
                'workspaceBranchId',
              ])),
          ...bindData,
        });

        const _doc = await this.client.index({
          index,
          id: docId,
          document,
        });

        return {
          status: SearchIndexStatus.ENTITY_DOC_INDEXED,
          document,
          _doc,
        };
      }
    } catch (error: any) {
      logger.error(error, { case: `Search indexing failed`, fields: { dto } });
      throw error;
    }
  }

  async searchByEntity(
    args: WithWorkspaceArgs<{
      e: AppEntity;
      query: SearchEntityQuery;
    }>,
  ): Promise<CustomerSearchResult[]> {
    const { workspace } = withWorkspaceArgs(args);
    const { e } = args;
    const { q, limit, filter: optionFilter } = args.query;

    if (!q || q.length === 0) return [];

    const workspaceId = workspace._id.toString();
    const index = this.getIndex(e);
    const entityConfig = this.entityConfigs[e];
    if (!entityConfig)
      throw new NotFoundException(AppMessage.SEARCH_ENTITY_NOT_FOUND);

    const filter: any[] = optionFilter
      ? Object.entries(optionFilter.filter).map(([key, value]) => ({
          term: { [key]: value },
        }))
      : [];

    const allowLowScore = optionFilter?.allowLowScore ?? false;

    const queryContainers: QueryDslQueryContainer[] = [];
    let codeQuery = '';

    Object.keys(entityConfig.properties).forEach((fieldName) => {
      const property = entityConfig.properties[fieldName];

      // Check if field has analyzer
      if (property.analyzer) {
        queryContainers.push({
          match: {
            [fieldName]: {
              query: q,
              analyzer: property.analyzer,
            },
          },
        });
      }

      // Check if field is code
      else if (fieldName === 'code') {
        const _q = q.replace('#', '');

        codeQuery = _q.includes(workspace.code)
          ? `${_q}`
          : !Number.isNaN(+q)
            ? `${workspace.code}${_q}`
            : _q;

        queryContainers.push({
          match: {
            code: {
              query: codeQuery,
            },
          },
        });

        queryContainers.push({
          match: {
            code: {
              query: `${codeQuery}${e}`,
            },
          },
        });
      }

      // Default
      else
        queryContainers.push({
          match: {
            [fieldName]: {
              query: q,
            },
          },
        });
    });

    const query: QueryDslQueryContainer = {
      bool: {
        filter: [{ term: { workspaceId } }, ...filter],
        should: queryContainers,
      },
    };

    const searchResult = await this.client.search({
      index,
      size: limit,
      query,
    });

    let output: SearchEntityResult[] = [
      ...searchResult.hits.hits.map((h) => {
        const _score =
          h._score && searchResult.hits.max_score
            ? h._score / searchResult.hits.max_score
            : 0;
        return {
          _id: h._id,
          _score,
          _maxScore: searchResult.hits.max_score,
          _highlight: h.highlight,
          _entity: e,
          ...(h._source as any),
        };
      }),
    ];

    if (!allowLowScore) {
      // Filter result zero score
      const _resultZeroScore = output.filter((v) => v._score <= 0);
      const _resultNonZeroScore = output.filter((v) => v._score > 0);

      if (_resultZeroScore.length > 0) {
        if (_resultNonZeroScore.length > 0) {
          output = _resultNonZeroScore;
        } else if (
          codeQuery.length > 0 &&
          JSON.stringify(_resultZeroScore[0]).indexOf(codeQuery) >= 0
        ) {
          output = [_resultZeroScore[0]];
        } else {
          output = [];
        }
      }

      // Filter result have low score
      if (output.length > 0 && output.some((v) => v._score === 1)) {
        const exactResults = output.filter((v) => v._score === 1);
        if (exactResults.length >= 3) {
          output = output.filter((v) => v._score >= 0.9);
        } else {
          output = exactResults;
        }
      }
    }

    return output;
  }

  async search(args: WithWorkspaceArgs<SearchQuery>): Promise<SearchResult> {
    const { workspace } = withWorkspaceArgs(args);
    let result: SearchResult = {};

    // Search all entities
    await Promise.all(
      Object.values(AppEntity).map(async (e) => {
        if (args.entities && !args.entities.includes(e)) return;
        try {
          const _result = await this.searchByEntity({
            workspace,
            e,
            query: args,
          });
          if (_result.length > 0) result[e] = _result;
        } catch (error) {
          if (error instanceof NotFoundException) {
            return e;
          } else {
            const prepared = await this.prepareIndex(e);
            if (prepared === 'CREATED') return e;
            logger.error(error, {
              case: 'Search failed',
              fields: {
                workspaceId: workspace._id.toString(),
                e,
                q: args.q,
              },
            });
          }
        }
      }),
    );

    // Sort result
    const sortEntities = Object.values(AppEntity)
      .reduce((out, entity) => {
        const _result = result[entity] as SearchEntityResult[];
        if (_result && _result.length > 0)
          out.push({ entity, maxScore: _result[0]._maxScore });
        return out;
      }, [])
      .sort((a, b) => b.maxScore - a.maxScore);

    const output = sortEntities.reduce((out, { entity }) => {
      out[entity] = result[entity];
      return out;
    }, {} as SearchResult);

    return output;
  }

  async prepareIndex(entity: AppEntity) {
    const index = this.getIndex(entity);

    // Search entity
    const entityConfig = this.entityConfigs[entity];
    if (!entityConfig) return 'NOT_FOUND';

    // Check if index existed
    const existed = await this.client.indices.exists({ index });
    if (existed) return 'EXISTED';

    // Create index and mapping
    logger.info(`Creating index`, {
      fields: {
        Entity: getKeyOfEnum(AppEntity, entity),
        Index: index,
      },
    });

    await this.client.indices.create({
      index,
      settings: {
        analysis: {
          analyzer: {
            icu_analyzer: {
              tokenizer: 'icu_tokenizer',
              filter: ['lowercase', 'icu_folding'],
            },
          },
        },
      } as any,
      mappings: {
        properties: {
          ...entityConfig.properties,
          workspaceId: { type: 'keyword' },
        },
      },
    });

    logger.info(`Index created`, {
      fields: {
        Entity: getKeyOfEnum(AppEntity, entity),
        Index: index,
      },
    });

    return 'CREATED';
  }

  async indexEntity(entity: AppEntity) {
    const searchEntity = this.entityConfigs[entity];
    if (!searchEntity) return entity;

    await this.prepareIndex(entity);

    // Mongo entities
    if (searchEntity.repository instanceof MongoRepository) {
      const docs = await searchEntity.repository.find({
        where: { isArchived: { $ne: true } },
        select: ['_id'],
      });

      docs.forEach((doc: any) => {
        const dto: SearchIndexInput = {
          id: doc._id.toString(),
          entity,
        };

        this.queueProducers.searchIndex(dto);
      });

      return {
        entity: getKeyOfEnum(AppEntity, entity),
        message: `[Mongo] Indexing ${docs.length} documents for entity ${getKeyOfEnum(AppEntity, entity)}`,
      };
    }

    // Postgres entities
    if (searchEntity.repository instanceof Repository) {
      const docs = await searchEntity.repository.find({
        where: { isArchived: Not(true) },
        select: ['id'],
      });

      docs.forEach((doc: any) => {
        const dto: SearchIndexInput = {
          id: doc.id,
          entity,
        };

        this.queueProducers.searchIndex(dto);
      });

      return {
        entity: getKeyOfEnum(AppEntity, entity),
        message: `[Postgres] Indexing ${docs.length} documents for entity ${getKeyOfEnum(AppEntity, entity)}`,
      };
    }
  }

  async indexAllEntities() {
    return Promise.all(
      Object.values(AppEntity).map(async (e) => {
        const index = this.getIndex(e);
        await this.client.indices.delete({ index }).catch(() => false);
        return this.indexEntity(e);
      }),
    );
  }

  async onApplicationBootstrap() {
    const availableEntities = this.getAvailableEntities();
    const indexedEntities: AppEntity[] = [];

    Promise.all(
      availableEntities.map(async (e) => {
        const index = this.getIndex(e);
        const isHasUnindexedEntities = await this.client.indices.exists({
          index,
        });
        if (isHasUnindexedEntities) return e;
        indexedEntities.push(e);
        await this.indexEntity(e);
      }),
    );
  }
}
