import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import mjml from 'mjml';
import nodemailer from 'nodemailer';
import { configs } from 'src/config/config';
import { cryptoDecrypt } from 'src/utils/crypto.util';
import { getFileUrlFromRelativePath } from '../files/files.utils';
import { translate } from '../lang/lang.utils';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/users.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  MailerAccount,
  SendMailInput,
  PluginMailerSendInternalWorkspace,
  PluginMailerSendUserDto,
  PluginMailerSendWorkspaceDto,
  TestSendMailInput,
} from './plugin-mailer.types';
import { renderTemplate } from './plugin-mailer.utils';
import { userMailTemplates } from './templates/plugin-mailer.user-templates';
import { workspaceMailTemplates } from './templates/plugin-mailer.workspace-templates';
import { renderPrevVnLocation } from '../locations/locations.utils';

@Injectable()
export class PluginMailerService {
  constructor(
    private readonly workspace: WorkspacesService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly queueProducers: QueueProducersService,
    private readonly users: UsersService,
  ) {}

  async renderUserTemplate(dto: PluginMailerSendUserDto) {
    const user =
      typeof dto.userId === 'string'
        ? await this.users.get(dto.userId)
        : dto.userId;

    const baseTemplate = await readFile(
      `email-templates/base-user.mjml`,
      'utf8',
    ).catch(() => undefined);

    if (!baseTemplate) return;

    const template = renderTemplate({
      template: baseTemplate,
      renders: {
        footerContent: () => `
        <mj-section text-align="left">
          <mj-column>
            <mj-text font-weight="700" padding-bottom="0">
              ${translate('regards', dto.locale || user.locale)}
            </mj-text>
          </mj-column>
        </mj-section>
        `,
        body: () => {
          const templateHandler = userMailTemplates[dto.template];
          if (!templateHandler) return '';
          return templateHandler.body({
            locale: dto.locale || user.locale,
            timezone: dto.timezone || user.settings?.timezoneId,
            user,
            params: dto.params,
          });
        },
      },
    });

    return mjml(template).html;
  }

  async sendUserWithTemplate(dto: PluginMailerSendUserDto) {
    const user =
      typeof dto.userId === 'string'
        ? await this.users.get(dto.userId)
        : dto.userId;
    const html = await this.renderUserTemplate(dto);
    const templateHandler = userMailTemplates[dto.template];
    if (!html || !templateHandler || !user.email) return;

    return this.triggerSend({
      to: user.email,
      subject: templateHandler.subject({ ...dto, user }),
      html,
    });
  }

  async renderWorkspaceTemplate(dto: PluginMailerSendWorkspaceDto) {
    const workspace =
      typeof dto.workspace === 'string'
        ? await this.workspace.get(dto.workspace)
        : dto.workspace;

    const baseTemplate = await readFile(
      `email-templates/base-workspace.mjml`,
      'utf8',
    ).catch(() => undefined);
    if (!baseTemplate) return;

    const template = renderTemplate({
      template: baseTemplate,
      renders: {
        wsLogo: () => getFileUrlFromRelativePath(workspace.logo),
        wsAddress: () =>
          `${translate('address', dto.locale)}: ${renderPrevVnLocation(workspace.location) || '--'}`,
        wsHotline: () =>
          `${translate('hotline', dto.locale)}: ${workspace.hotline || '--'}`,
        wsName: () => workspace.name,
        body: () => {
          const templateHandler = workspaceMailTemplates[dto.template];
          if (!templateHandler) return '';
          return templateHandler.body({ ...dto, workspace });
        },
      },
    });

    return mjml(template).html;
  }

  async sendWorkspaceWithTemplate(dto: PluginMailerSendWorkspaceDto) {
    const workspace =
      typeof dto.workspace === 'string'
        ? await this.workspace.get(dto.workspace)
        : dto.workspace;
    const html = await this.renderWorkspaceTemplate({ ...dto, workspace });
    const templateHandler = workspaceMailTemplates[dto.template];
    const settings = await this.workspace.getSettings(workspace._id.toString());
    if (!html || !templateHandler) return;

    return this.triggerSend({
      to: dto.to,
      subject: templateHandler.subject({ ...dto, workspace }),
      html,
      account: settings.mailer,
      fromName: workspace.name,
    });
  }

  async sendInternalWorkspace(dto: PluginMailerSendInternalWorkspace) {
    const members: WorkspaceMember[] = [];
    const workspaceId =
      typeof dto.workspace === 'string'
        ? dto.workspace
        : dto.workspace._id.toString();

    const bindMember = (member: WorkspaceMember) => {
      if (members.some((m) => m.userId === member.userId)) return;
      members.push(member);
    };

    if (dto.isAdminOnly) {
      const admins = await this.workspaceMembers.getAdmins(workspaceId);
      admins.forEach(bindMember);
    }

    if (dto.permission) {
      const permissionMembers = await this.workspaceMembers.getByPermission(
        workspaceId,
        dto.permission,
      );
      permissionMembers.forEach(bindMember);
    }

    if (dto.userIds) {
      const userIdsMembers = await this.workspaceMembers.getByUserIds(
        dto.userIds,
        workspaceId,
      );
      userIdsMembers.forEach(bindMember);
    }

    if (!members.length) return;

    return Promise.all(
      members.map((member) => {
        if (member.email) {
          return this.sendWorkspaceWithTemplate({
            ...dto,
            to: member.email,
            locale: member.locale,
            timezone: member.timezone,
          });
        }
      }),
    );
  }

  validateAccount(account?: MailerAccount) {
    if (!account || !account.user || !account.pass) return undefined;
    const decoded = cryptoDecrypt(account.pass, configs.ENCRYPT_PASSWORD);
    if (!decoded || account.user !== decoded.user || !decoded.pass)
      return undefined;
    return decoded as MailerAccount;
  }

  async triggerSend(dto: SendMailInput) {
    if (!dto.to) return;
    return this.queueProducers.sendMail(dto);
  }

  async sendTestMail(input: TestSendMailInput) {
    return this.send({
      to: input.to,
      subject: 'Test Send Mail',
      html: `<p>This is a test mail.</p>`,
      account: {
        user: input.accountUser,
        pass: input.accountPass,
      },
    });
  }

  async send(dto: SendMailInput) {
    const account = this.validateAccount(dto.account);

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: account?.user || configs.SYS_MAILER_USER_EMAIL,
        pass: account?.pass || configs.SYS_MAILER_USER_PASSWORD,
      },
    });

    return transporter.sendMail({
      from: `"${dto.fromName || 'Joy One'}" <${dto.from ?? configs.SYS_MAILER_USER_EMAIL}>`,
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
    });
  }
}
