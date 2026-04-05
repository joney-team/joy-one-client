"use client";

import { Badge } from "@/components/badge";
import { CustomerKycStatus, FileType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { OnModalPrompt } from "@/modals/modal-prompt";
import ApproveCustomerKycDocument from "@/modules/customer-kycs/graphql/approveCustomerKyc.graphql";
import { CustomerKycFragment } from "@/modules/customer-kycs/graphql/fragmentCustomerKyc.graphql";
import RejectCustomerKycDocument from "@/modules/customer-kycs/graphql/rejectCustomerKyc.graphql";
import { ModalFileGallery, ModalFileGalleryRef } from "@/modules/files/modals/modal-file-gallery";
import { useLocations } from "@/modules/locations/locations-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { String } from "@/utils/string.utils";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  CardProps,
  Divider,
  em,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconCheck, IconUserScan } from "@tabler/icons-react";
import { FC, useRef } from "react";
import { Button } from "../../../components/buttons/button";
import { EntityImage } from "../../../components/entity-image";
import { Renderer } from "../../../components/renderer";

interface CustomerKycCardProps {
  kyc: CustomerKycFragment;
  hideCustomer?: boolean;
  onApproved?: (kyc: CustomerKycFragment) => void;
  cardProps?: CardProps;
}

export const CustomerKycCard: FC<CustomerKycCardProps> = (props) => {
  const { kyc } = props;
  const { t } = useLingui();
  const workspace = useWorkspace();
  const customer = kyc.customer;
  const router = useRouter();
  const lastVersion = kyc.versions[kyc.versions.length - 1];
  const { renderVnLocation: renderLocation } = useLocations();
  const modalFileGalleryRef = useRef<ModalFileGalleryRef>(null);

  const [approveCustomerKyc] = useMutation(ApproveCustomerKycDocument);
  const [rejectCustomerKyc] = useMutation(RejectCustomerKycDocument);

  if (!lastVersion) return null;

  const onApprove = async () => {
    await onActionLoad({
      name: <Trans>Approve</Trans>,
      icon: IconCheck,
      process: async () => {
        const approvedKyc = await approveCustomerKyc({
          variables: {
            customerId: customer._id,
          },
        });
        if (!approvedKyc.data?.customerKyc) return;
        props.onApproved?.(approvedKyc.data?.customerKyc);
      },
    });
  };

  const onReject = () => {
    OnModalPrompt({
      title: String.capitalizeFirstLetter(`${t`Reject`} ${t`Customer KYC`}`),
      message: <Trans>Enter reject reason</Trans>,
      onSubmit: (reason) =>
        rejectCustomerKyc({
          variables: {
            customerId: customer._id,
            input: { reason },
          },
        }),
      icon: IconUserScan,
      color: "red",
      suggestions: [t`Wrong information`, t`Info does not match image`, t`Image is blurry`],
    });
  };

  const onView = (index = 0) => {
    modalFileGalleryRef.current?.open({
      index,
      disabled: true,
      files: [
        {
          url: lastVersion.frontOfCidImage,
          _id: "1",
          fileName: t`Front of CID`,
          type: FileType.Photo,
        },
        {
          url: lastVersion.backOfCidImage,
          _id: "2",
          fileName: t`Back of CID`,
          type: FileType.Photo,
        },
        {
          url: lastVersion.portraitImage,
          _id: "3",
          fileName: t`Portrait image`,
          type: FileType.Photo,
        },
      ],
    });
  };

  return (
    <Card className="CustomerKycCard" withBorder shadow="none" {...props.cardProps}>
      <Stack align="stretch">
        <Renderer visible={!props.hideCustomer}>
          <Group justify="space-between">
            <Text fz="sm">
              <Trans>Customer</Trans>
            </Text>
            <Anchor fw={500} onClick={() => router.push(`/customers/${customer.code}`)}>
              {customer.name}
            </Anchor>
          </Group>

          <Group justify="space-between">
            <Text fz="sm">
              <Trans>Phone</Trans>
            </Text>
            <Text fz="sm" fw={500}>
              {customer.phone || "--"}
            </Text>
          </Group>
        </Renderer>

        {lastVersion.cidNumber && (
          <Group justify="space-between">
            <Text fz="sm">
              <Trans>CID number</Trans>
            </Text>
            <Text fz="sm" fw={500}>
              {lastVersion.cidNumber}
            </Text>
          </Group>
        )}

        {lastVersion.cidFullName && (
          <Group justify="space-between" wrap="nowrap">
            <Text fz="sm">
              <Trans>Full name</Trans>
            </Text>
            <Text fz="sm" fw={500} ta="right">
              {lastVersion.cidFullName}
            </Text>
          </Group>
        )}

        {lastVersion.cidVnLocation && Object.keys(lastVersion.cidVnLocation).length > 0 && (
          <Group justify="space-between">
            <Text fz="sm">
              <Trans>Address</Trans>
            </Text>
            <Text fz="sm" fw={500}>
              {renderLocation(lastVersion.cidVnLocation, {
                shortProvine: true,
                shortWard: true,
              })}
            </Text>
          </Group>
        )}

        <Divider />

        <SimpleGrid cols={{ md: 3 }}>
          <Stack gap={5}>
            <Text fz={em(13)}>
              <Trans>Front of CID</Trans>
            </Text>
            <EntityImage w="100%" src={lastVersion.frontOfCidImage} onView={() => onView(0)} />
          </Stack>

          <Stack gap={5}>
            <Text fz={em(13)}>
              <Trans>Back of CID</Trans>
            </Text>
            <EntityImage w="100%" src={lastVersion.backOfCidImage} onView={() => onView(1)} />
          </Stack>

          <Stack gap={5}>
            <Text fz={em(13)}>
              <Trans>Portrait image</Trans>
            </Text>
            <EntityImage w="100%" src={lastVersion.portraitImage} onView={() => onView(2)} />
          </Stack>
        </SimpleGrid>

        {(function () {
          if (kyc.status === CustomerKycStatus.Approved)
            return (
              <Stack align="end">
                <Badge color="green">
                  <Trans>Approved</Trans>
                </Badge>
              </Stack>
            );

          if (kyc.status === CustomerKycStatus.Rejected)
            return (
              <Stack align="end" gap={5}>
                <Badge color="red">
                  <Trans>Rejected</Trans>
                </Badge>

                <Text fz={em(13)} fw={500} c="red">
                  <Trans>Reason</Trans>: {lastVersion.rejectReason ?? <Trans>Unknown reason</Trans>}
                </Text>
              </Stack>
            );

          if (!workspace.hasPermission(WorkspacePermission.CUSTOMER_KYCS_MANAGER)) return null;

          return (
            <Group justify="end">
              <Button leftIcon={IconCheck} onClick={onApprove}>
                <Trans>Approve</Trans>
              </Button>

              <Button variant="outline" color="gray" onClick={onReject}>
                <Trans>Reject</Trans>
              </Button>
            </Group>
          );
        })()}
      </Stack>

      <ModalFileGallery ref={modalFileGalleryRef} />
    </Card>
  );
};
