import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { PartnerCard } from "@/modules/partners/partner-card";
import { OnModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { EventType } from "@/modules/events/event-types";
import { getPartners } from "@/modules/partners/partners-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Stack } from "@mantine/core";
import { IconEdit, IconTopologyStar3 } from "@tabler/icons-react";
import { FC } from "react";

export const PartnerList: FC = () => {
  return (
    <Stack p={16}>
      <List
        fetch={(p) => getPartners(p)}
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
