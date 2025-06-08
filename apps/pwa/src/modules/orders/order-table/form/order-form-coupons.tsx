import { t } from "@/modules/lang/lang-service";
import { IconGiftCard } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "@/components/buttons/button";

export const OrderFormCoupons: FC = () => {
  return (
    <Button variant="outline" color="gray" flex={1} radius={100} leftIcon={IconGiftCard} fz={13} fw={400}>
      {t("coupons")}
    </Button>
  );
};
