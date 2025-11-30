import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { EventType } from "@/modules/events/event-types";
import { PartnerCard } from "@/modules/partners/components/partner-card";
import { ModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { t } from "@lingui/core/macro";
import { Stack } from "@mantine/core";
import { IconEdit, IconTopologyStar3 } from "@tabler/icons-react";
import { FC } from "react";
import { PartnerEntity } from "./partners-types";

export const PartnerList: FC = () => {
  return (
    <ModalParnterForm>
      {(open) => (
        <Stack p={16}>
          <List<PartnerEntity>
            columns={{
              logo: {
                defaultWidth: 80,
                name: t`Logo`,
                align: "center",
                render: ({ data }) => <Avatar partner={data} size={30} />,
              },
              name: { name: t`Name`, defaultWidth: 300 },
              phone: { name: t`Phone`, defaultWidth: 200 },
              email: { name: t`Email`, defaultWidth: 200 },
            }}
            id="pas"
            name={t`Partners`}
            route="/partners"
            icon={IconTopologyStar3}
            card={(props) => <PartnerCard partner={props.data} />}
            creatable={{
              onCreate: () => open(),
              permission: WorkspacePermission.PARTNERS_WRITE,
            }}
            events={[EventType.PARTNER_NEW, EventType.PARTNER_UPDATED, EventType.PARTNER_ARCHIVED]}
            actions={[
              {
                label: t`Edit`,
                icon: IconEdit,
                onClick: (data) => open({ partner: data }),
              },
            ]}
          />
        </Stack>
      )}
    </ModalParnterForm>
  );
};
