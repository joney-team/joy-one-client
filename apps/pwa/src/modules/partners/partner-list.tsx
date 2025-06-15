import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { EventType } from "@/modules/events/event-types";
import { OnModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { PartnerCard } from "@/modules/partners/components/partner-card";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Stack } from "@mantine/core";
import { IconEdit, IconTopologyStar3 } from "@tabler/icons-react";
import { FC } from "react";
import { PartnerEntity } from "./partners-types";

export const PartnerList: FC = () => {
  return (
    <Stack p={16}>
      <List<PartnerEntity>
        columns={{
          logo: {
            w: 40,
            align: "center",
            render: ({ data }) => <Avatar partner={data} size={30} />,
          },
          name: {},
          phone: {},
          email: {},
        }}
        id="pas"
        name="partners"
        route="/partners"
        icon={IconTopologyStar3}
        card={(props) => <PartnerCard partner={props.data} />}
        creatable={{
          onCreate: () => OnModalParnterForm({}),
          permission: WorkspacePermission.PARTNERS_WRITE,
        }}
        events={[EventType.PARTNER_NEW, EventType.PARTNER_UPDATED, EventType.PARTNER_ARCHIVED]}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            onClick: (data) => OnModalParnterForm({ partner: data }),
          },
        ]}
      />
    </Stack>
  );
};
