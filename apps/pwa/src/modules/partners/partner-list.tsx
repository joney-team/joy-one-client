"use client";

import { Avatar } from "@/components/avatar";
import { List } from "@/components/list";
import { EventType } from "@/graphql/enums.graphql";
import { PartnerCard } from "@/modules/partners/components/partner-card";
import { ModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Stack } from "@mantine/core";
import { IconEdit, IconTopologyStar3 } from "@tabler/icons-react";
import { FC } from "react";
import { PartnerEntity } from "./partners-types";

import { Trans } from "@lingui/react/macro";
import QUERY_PARTNERS from "./graphql/queryPartners.graphql";

export const PartnerList: FC = () => {
  return (
    <ModalParnterForm>
      {(open) => (
        <Stack p={16}>
          <List<PartnerEntity>
            columns={{
              logo: {
                defaultWidth: 80,
                name: <Trans>Logo</Trans>,
                align: "center",
                render: ({ data }) => <Avatar partner={data} size={30} />,
              },
              name: { name: <Trans>Name</Trans>, defaultWidth: 300 },
              phone: { name: <Trans>Phone</Trans>, defaultWidth: 200 },
              email: { name: <Trans>Email</Trans>, defaultWidth: 200 },
            }}
            id="pas"
            name={<Trans>Partners</Trans>}
            query={QUERY_PARTNERS}
            icon={IconTopologyStar3}
            card={(props) => <PartnerCard partner={props.data} />}
            creatable={{
              onCreate: () => open(),
              permission: WorkspacePermission.PARTNERS_WRITE,
            }}
            events={[EventType.PartnerNew, EventType.PartnerUpdated, EventType.PartnerArchived]}
            actions={[
              {
                label: <Trans>Edit</Trans>,
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
