import { AppRequest } from '../app.types';
import { replaceMultipleFields } from '../utils/object.utils';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';

function replacePhone(value: any) {
  if (!value) return '';
  // Only show last 4 digits and replace the rest with *
  return value.slice(-4).padStart(value.length, '*');
}

export const restrictCustomerContact = (args: {
  request: AppRequest;
  responseData: unknown;
}) => {
  const { request, responseData } = args;
  const isNeedRestrict =
    typeof responseData === 'object' &&
    (!request.member ||
      !request.member.permissions.includes(
        WorkspacePermission.CUSTOMERS_VIEW_CONTACT,
      ));

  if (!isNeedRestrict) return responseData;

  let data = responseData;
  data = replaceMultipleFields(data, ['phone', 'customerPhone'], replacePhone);
  data = replaceMultipleFields(data, ['relationshipContacts'], []);

  return data;
};
