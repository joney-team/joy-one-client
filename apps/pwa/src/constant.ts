import { t } from "@lingui/core/macro";
import { AppEntity, CalendarView, DynamicSelectionOperator, Gender } from "./types";
import { MantineColor } from "@mantine/core";
import { Icon, IconGenderBigender, IconGenderFemale, IconGenderMale } from "@tabler/icons-react";

export const appEntities: Record<AppEntity, { name: () => string }> = {
  [AppEntity.CUSTOMERS]: { name: () => t`Customers` },
  [AppEntity.CUSTOMER_FORMS]: { name: () => t`Customer Forms` },
  [AppEntity.PARTNERS]: { name: () => t`Partners` },
  [AppEntity.TASKS]: { name: () => t`Tasks` },
  [AppEntity.PRODUCTS]: { name: () => t`Products` },
  [AppEntity.PRODUCT_VOUCHERS]: { name: () => t`Product Vouchers` },
  [AppEntity.RECEIPTS]: { name: () => t`Receipts` },
  [AppEntity.BILLINGS]: { name: () => t`Billings` },
  [AppEntity.BANK_TRANSACTIONS]: { name: () => t`Bank Transactions` },
  [AppEntity.PRESCRIPTIONS]: { name: () => t`Prescriptions` },
  [AppEntity.LOANS]: { name: () => t`Loans` },
  [AppEntity.TAGS]: { name: () => t`Tags` },
  [AppEntity.COMMENTS]: { name: () => t`Comments` },
  [AppEntity.ORDERS]: { name: () => t`Orders` },
  [AppEntity.USERS]: { name: () => t`Users` },
  [AppEntity.WORKSPACES]: { name: () => "Workspaces" },
  [AppEntity.WORKSPACE_BRANCHES]: { name: () => t`Branches` },
  [AppEntity.WORKSPACE_MEMBERS]: { name: () => t`Members` },
  [AppEntity.MESSAGE_BOXES]: { name: () => t`Message Boxes` },
  [AppEntity.MESSAGES]: { name: () => t`Messages` },
  [AppEntity.POSTS]: { name: () => t`Posts` },
  [AppEntity.CATEGORIES]: { name: () => t`Categories` },
  [AppEntity.PROMOTIONS]: { name: () => t`Promotions` },
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
    name: () => string;
    color: MantineColor;
    icon: Icon;
  }
> = {
  [Gender.MALE]: { name: () => t`Male`, color: "blue", icon: IconGenderMale },
  [Gender.FEMALE]: { name: () => t`Female`, color: "pink", icon: IconGenderFemale },
  [Gender.OTHER]: { name: () => t`Other`, color: "orange", icon: IconGenderBigender },
};
