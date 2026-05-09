import { BookingEventData } from '../../bookings/bookings.types';
import { configs } from '../../config/config';
import { getShortName } from '../../customers/customers.utils';
import { EventType } from '../../events/events.types';
import { AppLocale } from '../../lang/lang.types';
import { translate } from '../../lang/lang.utils';
import { DateTime } from '../../utils/date-time';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';

export type WorkspaceMailTemplateContext<T> = {
  workspace: WorkspaceEntity;
  locale?: AppLocale;
  timezone?: string;
  params?: T;
};

export type PluginMailerWorkspaceTemplateArgs<Params> = {
  subject: (context: WorkspaceMailTemplateContext<Params>) => string;
  body: (context: WorkspaceMailTemplateContext<Params>) => string;
};

export type WorkspaceMailTemplates = {
  internal_newCustomerBooking: PluginMailerWorkspaceTemplateArgs<
    Partial<BookingEventData>
  >;
  customer_newBooking: PluginMailerWorkspaceTemplateArgs<
    Partial<BookingEventData>
  >;
  renew_password: PluginMailerWorkspaceTemplateArgs<{ code: string }>;
};

export type WorkspaceMailTemplate = keyof WorkspaceMailTemplates;

export const workspaceMailTemplates: WorkspaceMailTemplates = {
  internal_newCustomerBooking: {
    subject: (context) => {
      const date = context.params?.dateTime
        ? DateTime.format(context.params.dateTime, { locale: context.locale })
        : '--';
      return `${translate(`event_type_${EventType.BOOKING_NEW}`, context.locale)} ${context.params?.customerName || '--'} ${date}`;
    },
    body: (context) => {
      const date = context.params?.dateTime
        ? DateTime.format(context.params.dateTime, { locale: context.locale })
        : '--';

      return `
      <mj-section padding-top="0">
        <mj-column>
          <mj-text>
            ${translate(`event_type_${EventType.BOOKING_NEW}`, context.locale)}: <strong>${date}</strong>
            <br />
            ${translate('customer_name', context.locale)}: <strong>${context.params?.customerName || '--'}</strong>
            <br />
            ${translate('phone', context.locale)}: <strong>${context.params?.customerPhone || '--'}</strong>
            <br />
            ${translate('note', context.locale)}: <strong>${context.params?.bookingNote || '--'}</strong>
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="0px" text-align="left">
          <mj-column>
            <mj-button href="${configs.APP_URL}/customers/${context.params?.customerCode}" align="center" background-color="#414141" color="#ffffff" font-weight="normal" border-radius="10px" padding="10px 25px 10px 25px" inner-padding="10px 25px 10px 25px" line-height="120%" target="_blank" vertical-align="middle" border="none" text-align="center">
              ${translate('view_detail', context.locale)}
            </mj-button>
          </mj-column>
        </mj-section>
      `;
    },
  },
  customer_newBooking: {
    subject: (context) => {
      const date = context.params?.dateTime
        ? DateTime.format(context.params.dateTime, { locale: context.locale })
        : '--';
      return `${translate(`event_type_${EventType.BOOKING_NEW}`, context.locale)} ${context.params?.customerName || '--'} ${date}`;
    },
    body: (context) => {
      const date = context.params?.dateTime
        ? DateTime.format(context.params.dateTime, { locale: context.locale })
        : '--';
      const shortName = getShortName(context.params?.customerName || '--');

      return `
       <mj-section padding-top="0">
        <mj-column>
          <mj-text>
            <strong>${shortName}</strong> thân mến!
          </mj-text>
          
          <mj-text>
            Bạn có lịch hẹn vào ngày <strong>${date}</strong>
            <br />
            <br />

            Rất cảm ơn <strong>${shortName}</strong> đã tin tưởng và lựa chọn dịch vụ tại <strong>${context.workspace.name}</strong>
            <br />
            <br />

            Hẹn sớm gặp <strong>${shortName}</strong> ạ.
            <br />
            <br />

            Trân trọng cảm ơn và chúc <strong>${shortName}</strong> một ngày tốt lành ạ!
          </mj-text>
        </mj-column>
      </mj-section>
      `;
    },
  },
  renew_password: {
    subject: (context) => {
      return translate('renew_password_email', context.locale);
    },
    body: (context) => {
      return `
      <mj-section>
        <mj-column>
          <mj-text>
            ${translate('renew_password_email_body', context.locale, {
              code: context.params.code,
              expireTime: +configs.RENEW_PASSWORD_SESSION_EXPIRE_TIME / 60,
            })}
          </mj-text>
          
          <mj-text>
            ${translate('regards', context.locale)}
          </mj-text>
        </mj-column>
      </mj-section>
      `;
    },
  },
};
