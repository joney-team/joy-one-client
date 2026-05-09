import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { existsSync, mkdirSync } from 'fs';
import {
  HorizontalAlign,
  Jimp,
  loadFont,
  ResizeStrategy,
  VerticalAlign,
} from 'jimp';
import { PayloadException } from 'src/app.exceptions';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from 'src/database/database.utils';
import { EventDataActionType, EventType } from 'src/events/events.types';
import { UserEntity } from 'src/users/entities/user.entity';
import { MongoRepository, Not } from 'typeorm';
import { getColor } from '../app.colors';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity, PageMetadata } from '../app.types';
import { configs } from '../config/config';
import { primaryColor } from '../config/config.constants';
import { DatabaseName } from '../database/database.types';
import { renderFileLink } from '../files/files.utils';
import { AppLocale } from '../lang/lang.types';
import { translate } from '../lang/lang.utils';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/users.types';
import { isDiff } from '../utils/diff.utils';
import { StringUtils } from '../utils/string.utils';
import { WorkspaceBranchesService } from '../workspace-branches/workspace-branches.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceDefaultRoleId } from '../workspace-roles/workspace-roles.types';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from './entities/workspace.entity';
import {
  CreateWorkspaceInput,
  WorkspaceInput,
  WorkspaceInviteInformation,
  WorkspaceType,
} from './workspaces.types';
import { withWorkspaceArgs, WithWorkspaceArgs } from './workspaces.utils';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(WorkspaceEntity, DatabaseName.MONGO)
    public repository: MongoRepository<WorkspaceEntity>,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly members: WorkspaceMembersService,
    private readonly settings: WorkspaceSettingsService,
    private readonly users: UsersService,
    @Inject(forwardRef(() => WorkspaceBranchesService))
    private readonly branches: WorkspaceBranchesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async randomCode(name?: string, ignore?: string, retry = 0): Promise<string> {
    if (retry >= 100) {
      throw new BadRequestException('Cannot generate random code');
    }

    let code = name ? name.toUpperCase().split(' ')[0] : '';

    if (name && !ignore) {
      if (name.split(' ').length === 1) {
        code = name.toUpperCase().slice(0, 3);
      } else if (name.split(' ').length > 1) {
        code = name
          .split(' ')
          .map((v) => v[0])
          .join('')
          .toUpperCase()
          .slice(0, 5);
      }
    }

    if (!code || (ignore && code === ignore)) {
      // Random alphanumeric code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < 2; i++) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
    }

    if (code) {
      //Đổi ký tự có dấu thành không dấu
      code = code.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
      code = code.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
      code = code.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
      code = code.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
      code = code.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
      code = code.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
      code = code.replace(/đ/gi, 'd');
      //Xóa các ký tự đặt biệt
      // eslint-disable-next-line
      code = code.replace(
        /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
        '',
      );
      //Đổi khoảng trắng thành ký tự gạch ngang
      code = code.replace(/ /gi, '-');
      //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
      //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
      // eslint-disable-next-line
      code = code.replace(/\-\-\-\-\-/gi, '-');
      // eslint-disable-next-line
      code = code.replace(/\-\-\-\-/gi, '-');
      // eslint-disable-next-line
      code = code.replace(/\-\-\-/gi, '-');
      // eslint-disable-next-line
      code = code.replace(/\-\-/gi, '-');
      //Xóa các ký tự gạch ngang ở đầu và cuối
      code = '@' + code + '@';
      // eslint-disable-next-line
      code = code.replace(/\@\-|\-\@|\@/gi, '');
    }

    const isExisted = await this.repository.findOne({ where: { code } });
    if (isExisted) return this.randomCode(name, code, retry + 1);

    return code;
  }

  isValidCode(code: string) {
    return /^[A-Z0-9]+$/.test(code);
  }

  async create(user: UserEntity, input: CreateWorkspaceInput, inherit = false) {
    const isNameExisted = await this.repository.findOne({
      where: { name: input.name },
    });

    if (isNameExisted)
      throw new PayloadException({ name: AppMessage.WORKSPACE_NAME_EXISTED });

    const isCodeExisted = await this.repository.findOne({
      where: { code: input.code },
    });

    if (isCodeExisted)
      throw new PayloadException({ name: AppMessage.WORKSPACE_CODE_EXISTED });

    if (!this.isValidCode(input.code))
      throw new PayloadException({ code: AppMessage.INVALID_CODE });

    if (input.type && !Object.values(WorkspaceType).includes(input.type)) {
      throw new PayloadException({ type: AppMessage.INVALID_WORKSPACE_TYPE });
    }

    const workspace = new WorkspaceEntity();

    workspace.name = input.name;
    workspace.code = input.code;
    workspace.logo = input.logo;
    workspace.logoVersion = 1;
    workspace.location = Object.keys(input.location || {}).length
      ? input.location
      : undefined;
    workspace.hotline = input.hotline;
    workspace.phone = input.phone;
    workspace.type = input.type;
    workspace.inherit = inherit;

    workspace.appColor = input.appColor;
    workspace.appDomain = input.appDomain;
    workspace.appIcon = input.appIcon;
    workspace.appName = input.appName;
    workspace.locale = input.locale;
    workspace.branches = 0;

    await this.generateInviteCode(workspace, false);
    await this.repository.save(workspace);

    // Initialize workspace
    await this.members.join({
      workspace,
      user,
      assignRoleIds: [WorkspaceDefaultRoleId.OWNER],
      ignoreEvent: true,
    });

    await this.syncDomain(workspace._id.toString());

    // Ref code
    if (input.refCode) {
      const user = await this.users
        .getByRefCode(input.refCode)
        .catch(() => null);
      if (user) workspace.businessPartnerUserId = user._id.toString();
    }

    this.queueProducers.captureEvent({
      ref: workspace._id.toString(),
      workspaceId: workspace._id.toString(),
      userId: user._id.toString(),
      actionType: EventDataActionType.CREATE,
      type: EventType.WORKSPACE_NEW,
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACES,
          id: workspace._id.toString(),
          index: true,
        },
      ],
    });

    logger.info(`New workspace`, {
      fields: {
        Type: workspace.type,
        WorkspaceName: workspace.name,
        Hotline: workspace.hotline,
        Owner: user.name,
      },
    });

    await this.queueProducers.registerWorkspaceSchedule(
      workspace._id.toString(),
    );

    return workspace;
  }

  async get(id: RawObjectId) {
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });

    if (!data) {
      throw new NotFoundException(AppMessage.WORKSPACE_NOT_FOUND, {
        cause: { _id: id },
      });
    }

    return this.bindData(data);
  }

  async getByInviteCode(inviteCode: string) {
    const data = await this.repository.findOne({ where: { inviteCode } });
    if (!data)
      throw new NotFoundException(AppMessage.WORKSPACE_NOT_FOUND, {
        cause: { inviteCode },
      });
    return this.bindData(data);
  }

  async getByDomain(domain: string) {
    const data = await this.repository.findOne({
      where: { appDomain: domain },
    });
    if (!data) throw new NotFoundException(AppMessage.WORKSPACE_NOT_FOUND);
    return this.bindData(data);
  }

  async update(args: WithWorkspaceArgs<{ input: WorkspaceInput }>) {
    const { workspaceId, member, input } = withWorkspaceArgs(args);
    const workspace = await this.get(workspaceId);

    const isNameExisted = await this.repository.findOne({
      where: { name: input.name, _id: Not(workspaceId) },
    });

    if (isNameExisted) {
      throw new PayloadException({ name: AppMessage.WORKSPACE_NAME_EXISTED });
    }

    if (input.type && !Object.values(WorkspaceType).includes(input.type)) {
      throw new PayloadException({ type: AppMessage.INVALID_WORKSPACE_TYPE });
    }

    const isDiffNeedToGenerateCoverImage = isDiff(workspace, input, [
      'name',
      'logo',
      'appColor',
    ]);

    workspace.name = input.name;
    workspace.logo = input.logo;
    workspace.location = Object.keys(input.location || {}).length
      ? input.location
      : undefined;
    workspace.hotline = input.hotline;
    workspace.phone = input.phone;
    workspace.type = input.type;

    workspace.appColor = input.appColor;
    workspace.appColorShape = input.appColorShape;
    workspace.appDomain = input.appDomain;
    workspace.appIcon = input.appIcon;
    workspace.appName = input.appName;
    workspace.locale = input.locale;

    await this.repository.save(workspace);

    // Generate cover image if name or logo is changed
    if (isDiffNeedToGenerateCoverImage) {
      await this.generateCoverImage(workspace);
    }

    // Sync domain
    await this.syncDomain(workspace._id.toString());

    if (member) {
      this.queueProducers.captureEvent({
        ref: workspace._id.toString(),
        workspaceId: member.workspaceId,
        userId: member.userId,
        type: EventType.WORKSPACE_UPDATED,
        persist: true,
        actionType: EventDataActionType.UPDATE,
        relatedEntities: [
          {
            entity: AppEntity.WORKSPACES,
            id: workspace._id.toString(),
            index: true,
          },
        ],
      });
    }

    await this.queueProducers.registerWorkspaceSchedule(
      workspace._id.toString(),
    );

    return this.bindData(workspace);
  }

  async list(args: {
    query?: any;
    user?: UserEntity;
    select?: (keyof WorkspaceEntity)[];
  }) {
    let where: any = {};

    if (
      args.user &&
      ![UserRole.ADMIN, UserRole.SYS_ADMIN].includes(args.user.role)
    ) {
      where['businessPartnerUserId'] = args.user._id.toString();
    }

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        where,
        filterFields: ['name', 'hotline', 'type'],
        select: args.select,
        allowGetAll: true,
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  bindData(data: WorkspaceEntity, placeholder = true): WorkspaceEntity {
    let ws = { ...data } as WorkspaceEntity;

    if (placeholder) {
      ws.appColor = ws.appColor || 'primary';
      ws.appIcon =
        ws.appIcon ||
        `https://ui-avatars.com/api/?background=${getColor(ws.appColor || primaryColor).replace('#', '')}&format=png&name=${ws.code}&bold=true&color=fff&rounded=true`;
      ws.logo = ws.logo || ws.appIcon;
    }

    ws.cover = `${configs.API_URL}/workspaces/${ws._id?.toString()}/cover.png?v=${ws.logoVersion || 0}`;

    return ws;
  }

  async getSettings(workspaceId: any) {
    return this.settings.get(workspaceId);
  }

  async archive(member: WorkspaceMember) {
    const workspace = await this.get(member.workspaceId);

    if (
      !member.roles.some(
        (role) => role._id.toString() === WorkspaceDefaultRoleId.OWNER,
      )
    ) {
      throw new BadRequestException(
        AppMessage.ONLY_OWNER_CAN_ARCHIVE_WORKSPACE,
      );
    }

    workspace.isArchived = true;

    await this.repository.save(workspace);

    this.queueProducers.captureEvent({
      ref: workspace._id.toString(),
      workspaceId: workspace._id.toString(),
      userId: member.userId,
      persist: true,
      type: EventType.WORKSPACE_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      relatedEntities: [
        {
          entity: AppEntity.WORKSPACES,
          id: workspace._id.toString(),
          index: true,
        },
      ],
    });

    return workspace;
  }

  async generateCoverImage(workspace: WorkspaceEntity) {
    try {
      const folderPath = `public/files/workspaces/${workspace._id.toString()}`;
      const coverImagePath = `${folderPath}/cover.png` as `${string}.${string}`;

      const folderExisted = existsSync(folderPath);
      if (!folderExisted) mkdirSync(folderPath, { recursive: true });

      const ratio = 16 / 9;
      const width = 500;
      const height = width / ratio;

      const generateWithLogo = async () => {
        const logoBuffer = await axios.get(renderFileLink(workspace.logo), {
          responseType: 'arraybuffer',
        });
        const logo = await Jimp.read(logoBuffer.data);

        const ratio = 16 / 9;
        const width = 500;
        const height = width / ratio;
        const logoHeightRate = 0.85;

        const frame = new Jimp({ width, height, color: '#ffffff' });

        logo.resize({
          h: height * logoHeightRate,
          mode: ResizeStrategy.BEZIER,
        });
        const centerX = width / 2 - (height * logoHeightRate) / 2;
        const centerY = height / 2 - (height * logoHeightRate) / 2;
        frame.blit({ src: logo, x: centerX, y: centerY });
        await frame.write(coverImagePath);
      };

      const generateWithName = async () => {
        const color = getColor(workspace.appColor || 'primary');
        const frame = new Jimp({ width, height, color: color });

        // Workspace name
        const brandName = new Jimp({ width: 500, height: 500 });
        const font = await loadFont(
          'src/assets/fonts/Roboto-Black.ttf/BHY5mfuf33kQcqIQNSlG1HGu.ttf.fnt',
        );
        brandName.print({
          x: 0,
          y: 0,
          text: {
            text: StringUtils.removeAccents(workspace.name),
            alignmentX: HorizontalAlign.CENTER,
            alignmentY: VerticalAlign.MIDDLE,
          },
          font,
          maxWidth: 500,
          maxHeight: 500,
        });

        brandName.color([
          { apply: 'xor', params: [{ r: 255, g: 255, b: 255 }] },
        ]);
        brandName.resize({ w: height, h: height, mode: ResizeStrategy.BEZIER });

        const centerX = width / 2 - height / 2;
        frame.blit({ src: brandName, x: centerX, y: 0 });

        await frame.write(coverImagePath);
      };

      if (workspace.logo) {
        await generateWithLogo().catch(() => generateWithName());
      } else {
        await generateWithName();
      }

      await this.repository.update(workspace._id, {
        logoVersion: (workspace.logoVersion || 0) + 1,
      });

      return coverImagePath;
    } catch (error) {
      logger.error(error, {
        case: `Generate conver image`,
        fields: {
          workspaceId: workspace._id.toString(),
          workspaceCode: workspace.code,
        },
      });
      return null;
    }
  }

  async getCoverImage(workspaceId: any) {
    const workspace = await this.get(workspaceId);
    const path = `public/files/workspaces/${workspace._id.toString()}/cover.png`;
    const isExisted = existsSync(path);
    if (isExisted) return path;
    const _path = await this.generateCoverImage(workspace);
    if (!_path) throw new NotFoundException(AppMessage.IMAGE_NOT_AVAILABLE);
    return _path;
  }

  async syncDomain(workspaceId: any) {
    // TODO: Sync domain
  }

  async generateInviteCode(workspace: WorkspaceEntity, save = true) {
    // Generate subffix with 4 random characters is only
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const subffix = Array.from(
      { length: 4 },
      () => characters[Math.floor(Math.random() * characters.length)],
    ).join('');

    const inviteCode = `${workspace.code + subffix}`.trim().toLowerCase();
    workspace.inviteCode = inviteCode;

    if (save) {
      await this.repository.update(workspace._id, {
        inviteCode: workspace.inviteCode,
      });

      await this.members.syncWorkspace(workspace._id.toString());

      this.queueProducers.captureEvent({
        ref: workspace._id.toString(),
        workspaceId: workspace._id.toString(),
        type: EventType.WORKSPACE_INVITE_CODE_UPDATED,
        actionType: EventDataActionType.UPDATE,
      });

      return workspace;
    }

    return workspace;
  }

  async inviteInformation(
    inviteCode: string,
  ): Promise<WorkspaceInviteInformation> {
    const workspace = await this.repository.findOne({ where: { inviteCode } });
    if (!workspace) throw new NotFoundException(AppMessage.WORKSPACE_NOT_FOUND);

    const information: WorkspaceInviteInformation = {
      workspaceId: workspace._id.toString(),
      name: workspace.name,
      logo: workspace.logo,
      hotline: workspace.hotline,
      phone: workspace.phone,
      type: workspace.type,
      appColor: workspace.appColor,
    };

    return information;
  }

  async inviteMetadata(inviteCode: string, locale?: AppLocale) {
    const workspace = await this.repository.findOne({ where: { inviteCode } });
    if (!workspace) throw new NotFoundException(AppMessage.WORKSPACE_NOT_FOUND);

    const _workspace = await this.get(workspace._id.toString());
    const metadata: PageMetadata = {
      title: translate('invite_workspace', locale, { name: workspace.name }),
      description: translate('invite_workspace_desc', locale),
      images: [_workspace.cover],
    };

    return metadata;
  }

  async getByCode(code: string) {
    const workspace = await this.repository.findOne({ where: { code } });
    if (!workspace) throw new NotFoundException(AppMessage.WORKSPACE_NOT_FOUND);
    return this.bindData(workspace);
  }

  async sync(workspaceId: RawObjectId) {
    const workspace = await this.get(workspaceId);
    const branches = await this.branches.list({
      workspaceId: workspace._id.toString(),
      query: { limit: 1 },
    });
    workspace.branches = branches.count;
    await this.repository.save(workspace);
  }
}
