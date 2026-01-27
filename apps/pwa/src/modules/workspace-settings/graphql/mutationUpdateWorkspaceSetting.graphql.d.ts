import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateWorkspaceSettingMutationVariables = Types.Exact<{
  bankAccount?: Types.InputMaybe<Types.PluginBankAccountInput>;
  schedule?: Types.InputMaybe<Types.WorkspaceScheduleInput>;
  mailer?: Types.InputMaybe<Types.PluginMailerAccountInput>;
  hrmTimeKeepingsRules?: Types.InputMaybe<Types.HrmTimekeepingsRulesInput>;
  bookingsAutoRemindCustomerBookingBeforeDays?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  allowTip?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  allowDuplicateBookings?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  memberPermissions?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  bookingsAutoRemindCustomerBookingTime?: Types.InputMaybe<Types.Scalars['String']['input']>;
  loanSettings?: Types.InputMaybe<Types.LoanSettingsInput>;
  termsOfService?: Types.InputMaybe<Types.Scalars['String']['input']>;
  privacyPolicy?: Types.InputMaybe<Types.Scalars['String']['input']>;
  receiptImagesRequired?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  receiptPaymentMethodDefault?: Types.InputMaybe<Types.ReceiptPaymentMethod>;
  view?: Types.InputMaybe<Types.WorkspaceViewInput>;
  searchSettings?: Types.InputMaybe<Types.WorkspaceSearchSettingsInput>;
  currencyCode?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isAuthSessionRestricted?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  zaloOaGmfGroupSettings?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
  allowPayTicketMultipleTimes?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type UpdateWorkspaceSettingMutation = { __typename: 'Mutation', updateWorkspaceSetting: { __typename: 'WorkspaceSetting', _id: string, wSlots: Array<any> | null, bookingsAutoRemindCustomerBookingBeforeDays: number | null, allowTip: boolean | null, allowDuplicateBookings: boolean | null, memberPermissions: Array<string> | null, bookingsAutoRemindCustomerBookingTime: string | null, termsOfService: string | null, privacyPolicy: string | null, receiptImagesRequired: boolean | null, receiptPaymentMethodDefault: Types.ReceiptPaymentMethod | null, currencyCode: string | null, isAuthSessionRestricted: boolean | null, zaloOaGmfGroupSettings: any | null, allowPayTicketMultipleTimes: boolean | null, updatedAt: number | null, schedule: { __typename: 'WorkspaceSchedule', timezone: string | null, workingDays: Array<{ __typename: 'WorkingDay', day: Types.DayOfWeek, hours: Array<{ __typename: 'TimeRange', start: string, end: string }> }> } | null, bankAccount: { __typename: 'PluginBankAccount', bankId: number, accountNumber: string, accountName: string | null } | null, mailer: { __typename: 'PluginMailerAccount', user: string, pass: string } | null, hrmTimeKeepingsRules: { __typename: 'HrmTimekeepingsRules', requirePhoto: boolean | null, acceptLatenessUpToMins: number | null, acceptOverTimeAtLeastMins: number | null, acceptLocations: Array<{ __typename: 'CheckInLocation', name: string, radius: number, disabled: boolean | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } }> | null } | null, loanSettings: { __typename: 'LoanSettings', assetEstimationPriceSpreadRate: number | null, liquidationFeeRate: number | null, warningReceiptBeforeDays: number | null, isAutoSelectWorkspaceBranch: boolean | null, contractPdfUrl: string | null, contractLiquidationPdfUrl: string | null, receiptPdfUrl: string | null, loanPackages: Array<{ __typename: 'LoanPackage', id: string, assetTypes: Array<Types.LoanAssetType>, type: Types.LoanPackageType, days: number, periodDaysOptions: Array<number>, contractFee: number, unFixedCapitalRates: Array<Array<number>>, description: string | null, liquidationFeeRate: number | null, lateInterestRates: Array<{ __typename: 'LateInterestRate', lateDays: number, rate: number }> }> } | null, view: { __typename: 'WorkspaceView', menu: Array<{ __typename: 'WorkspaceViewComponent', id: string, type: string, moduleId: string | null, dividerName: string | null }> | null, dashboardWidgets: Array<{ __typename: 'DisplayWidget', id: string, type: string, state: any | null }> | null, reportWidgets: Array<{ __typename: 'DisplayWidget', id: string, type: string, state: any | null }> | null } | null, searchSettings: { __typename: 'WorkspaceSearchSettings', hideEntities: Array<string> | null } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const UpdateWorkspaceSettingDocument = (import("graphql").DocumentNode) as TypedDocumentNode<UpdateWorkspaceSettingMutation, UpdateWorkspaceSettingMutationVariables>;
export default UpdateWorkspaceSettingDocument 