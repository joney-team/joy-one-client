import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { Icon, IconGenderBigender, IconGenderFemale, IconGenderMale } from "@tabler/icons-react";
import { Gender } from "./graphql/enums.graphql";
import { AppEntity, CalendarView, DynamicSelectionOperator } from "./types";

export const appEntities: Record<AppEntity, { name: MacroMessageDescriptor }> = {
  [AppEntity.CUSTOMERS]: { name: defineMessage`Customers` },
  [AppEntity.CUSTOMER_FORMS]: { name: defineMessage`Customer Forms` },
  [AppEntity.PARTNERS]: { name: defineMessage`Partners` },
  [AppEntity.TASKS]: { name: defineMessage`Tasks` },
  [AppEntity.PRODUCTS]: { name: defineMessage`Products` },
  [AppEntity.PRODUCT_VOUCHERS]: { name: defineMessage`Product Vouchers` },
  [AppEntity.RECEIPTS]: { name: defineMessage`Receipts` },
  [AppEntity.BILLINGS]: { name: defineMessage`Billings` },
  [AppEntity.BANK_TRANSACTIONS]: { name: defineMessage`Bank Transactions` },
  [AppEntity.PRESCRIPTIONS]: { name: defineMessage`Prescriptions` },
  [AppEntity.LOANS]: { name: defineMessage`Loans` },
  [AppEntity.TAGS]: { name: defineMessage`Tags` },
  [AppEntity.COMMENTS]: { name: defineMessage`Comments` },
  [AppEntity.ORDERS]: { name: defineMessage`Orders` },
  [AppEntity.USERS]: { name: defineMessage`Users` },
  [AppEntity.WORKSPACES]: { name: defineMessage`Workspaces` },
  [AppEntity.WORKSPACE_BRANCHES]: { name: defineMessage`Branches` },
  [AppEntity.WORKSPACE_MEMBERS]: { name: defineMessage`Members` },
  [AppEntity.MESSAGE_BOXES]: { name: defineMessage`Message Boxes` },
  [AppEntity.MESSAGES]: { name: defineMessage`Messages` },
  [AppEntity.POSTS]: { name: defineMessage`Posts` },
  [AppEntity.CATEGORIES]: { name: defineMessage`Categories` },
  [AppEntity.PROMOTIONS]: { name: defineMessage`Promotions` },
  [AppEntity.ACTIVITIES]: { name: defineMessage`Activities` },
};

export const calendarViews: Record<CalendarView, { name: () => string }> = {
  [CalendarView.DAY]: { name: () => t`Day` },
  [CalendarView.WEEK]: { name: () => t`Week` },
  [CalendarView.MONTH]: { name: () => t`Month` },
};

export const dynamicSelectionOperators: Record<DynamicSelectionOperator, { name: () => string }> = {
  [DynamicSelectionOperator.INCLUDES]: { name: () => t`Includes` },
  [DynamicSelectionOperator.EXCLUDES]: { name: () => t`Excludes` },
};

export const genders: Record<
  Gender,
  {
    name: MacroMessageDescriptor;
    color: MantineColor;
    icon: Icon;
  }
> = {
  [Gender.Male]: { name: defineMessage`Male`, color: "blue", icon: IconGenderMale },
  [Gender.Female]: { name: defineMessage`Female`, color: "pink", icon: IconGenderFemale },
  [Gender.Other]: { name: defineMessage`Other`, color: "orange", icon: IconGenderBigender },
};
