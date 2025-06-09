"use client";

import { ModalFiles } from "@/modules/files/modals/modal-files";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { type FC } from "react";
import { ModalBookingDetail } from "../modules/bookings/modals/modal-booking-detail";
import { ModalNextBooking } from "../modules/bookings/modals/modal-next-booking";
import { ModalCouponForm } from "../modules/coupons/modals/modal-coupon-form";
import { ModalCouponRuleForm } from "../modules/coupons/modals/modal-coupon-rule-form";
import { ModalRegisterCustomerKyc } from "../modules/customer-kycs/modal-register-customer-kyc";
import { ModalCustomerRelationShipForm } from "../modules/customers/modals/modal-customer-relationship-form";
import { ModalFileGallery } from "../modules/files/modals/modal-file-gallery";
import { ModalLang } from "../modules/lang/modal-language";
import { ModalCreateLoan } from "../modules/loans/modals/modal-create-loan";
import { ModalLoanAssetEstimationForm } from "../modules/loans/modals/modal-loan-asset-estimation-form";
import { ModalLoanCalculator } from "../modules/loans/modals/modal-loan-calculator";
import { ModalLoanPackageForm } from "../modules/loans/modals/modal-loan-package-form";
import { ModalSignLoan } from "../modules/loans/modals/modal-sign-loan";
import { ModalParnterForm } from "../modules/partners/modals/modal-partner-form";
import { ModalProductCombo } from "../modules/product-combos/modals/modal-product-combo";
import { ModalProductComboUsing } from "../modules/product-combos/modals/modal-product-combo-using";
import { ModalProductStockIn } from "../modules/product-stocks/modals/modal-product-stock-in";
import { ModalProductStockOut } from "../modules/product-stocks/modals/modal-product-stock-out";
import { ModalCreateTask } from "../modules/tasks/modals/modal-create-task";
import { ModalUserInformation } from "../modules/users/modals/modal-user-information";
import { ModalUpdateWorkspaceBranch } from "../modules/workspace-branches/modals/modal-update-workspace-branch";
import { ModalWorkspaceSdkForm } from "../modules/workspace-sdks/modals/modal-workspace-sdk-form";
import { ModalCheckInLocationForm } from "./modal-check-in-location-form";
import { ModalInput } from "./modal-input";
import { ModalInstallWebAppTutorial } from "./modal-install-web-app-tutorial";
import { ModalPrinter } from "./modal-printer";
import { ModalSharelink } from "./modal-share-link";
import { ModalUpgradeVersion } from "./modal-upgrade-version";

const Modals: FC = () => {
  const workspace = useWorkspace();

  if (!workspace.userMember) return null;

  return (
    <>
      <ModalProductCombo />
      <ModalProductComboUsing />
      <ModalProductStockIn />
      <ModalProductStockOut />
      <ModalUserInformation />
      <ModalLoanCalculator />
      <ModalLoanPackageForm />
      <ModalCouponForm />
      <ModalCouponRuleForm />
      <ModalCreateLoan />
      <ModalSignLoan />
      <ModalRegisterCustomerKyc />
      <ModalLoanAssetEstimationForm />
      <ModalWorkspaceSdkForm />
      <ModalNextBooking />
      <ModalInstallWebAppTutorial />
      <ModalParnterForm />
      <ModalUpgradeVersion />
      <ModalBookingDetail />
      <ModalPrinter />
      <ModalFiles />
      <ModalSharelink />
      <ModalCustomerRelationShipForm />
      <ModalFileGallery />
      <ModalLang />
      <ModalCreateTask />
      <ModalCheckInLocationForm />
      <ModalUpdateWorkspaceBranch />
      <ModalInput />
    </>
  );
};

export default Modals;
