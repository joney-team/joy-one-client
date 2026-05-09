import { configs } from '../../config/config';
import { AppLocale } from '../../lang/lang.types';
import { translate } from '../../lang/lang.utils';
import { UserEntity } from '../../users/entities/user.entity';

export type UserMailTemplateContext<T> = {
  user: UserEntity;
  locale?: AppLocale;
  timezone?: string;
  params?: T;
};

export type UserMailTemplateArgs<Params> = {
  subject: (context: UserMailTemplateContext<Params>) => string;
  body: (context: UserMailTemplateContext<Params>) => string;
};

export type UserMailTemplates = {
  renew_password: UserMailTemplateArgs<{ code: string }>;
};

export type UserMailTemplate = keyof UserMailTemplates;

export const userMailTemplates: UserMailTemplates = {
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
        </mj-column>
      </mj-section>
      `;
    },
  },
};
