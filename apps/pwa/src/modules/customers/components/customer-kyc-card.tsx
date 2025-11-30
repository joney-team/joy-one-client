"use client";

import { DateFormat } from "@/components/format/date-format";
import { FileType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { OnModalPrompt } from "@/modals/modal-prompt";
import {
  approveCustomerKyc,
  rejectCustomerKyc,
} from "@/modules/customer-kycs/customer-kycs-service";
import {
  type CustomerKycEntity,
  CustomerKycStatus,
} from "@/modules/customer-kycs/customer-kycs-types";
import { ModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { useLocations } from "@/modules/locations/locations-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Anchor,
  Badge,
  Card,
  CardProps,
  Divider,
  em,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconArrowsDiagonal, IconCheck, IconUserScan } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "../../../components/buttons/button";
import { EntityImage } from "../../../components/entity-image";
import { Image } from "../../../components/image";
import { Renderer } from "../../../components/renderer";

interface CustomerKycCardProps {
  kyc: CustomerKycEntity;
  hideCustomer?: boolean;
  onApproved?: (kyc: CustomerKycEntity) => void;
  cardProps?: CardProps;
}

export const CustomerKycCard: FC<CustomerKycCardProps> = (props) => {
  const { kyc } = props;
  const workspace = useWorkspace();
  const customer = kyc.customer;
  const router = useRouter();
  const lastVersion = kyc.versions[kyc.versions.length - 1]!;
  const { renderVnLocation: renderLocation } = useLocations();

  if (!lastVersion) return null;

  const onApprove = async () => {
    await onActionLoad({
      name: <Trans>Approve</Trans>,
      icon: IconCheck,
      process: async () => {
        const _kyc = await approveCustomerKyc(customer._id);
        props.onApproved?.(_kyc);
      },
    });
  };

  const onReject = () => {
    OnModalPrompt({
      title: String.capitalizeFirstLetter(`${t`Reject`} ${t`Customer KYC`}`),
      message: <Trans>Enter reject reason</Trans>,
      onSubmit: (reason) => rejectCustomerKyc(customer._id, { reason }),
      icon: IconUserScan,
      color: "red",
      suggestions: [t`Wrong information`, t`Info does not match image`, t`Image is blurry`],
    });
  };

  return (
    <ModalFileGallery>
      {(openGallery) => {
        const onView = (index = 0) => {
          openGallery({
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
              <Text fz={em(12)}>
                <DateFormat value={lastVersion.createdAt} type="date" />
              </Text>

              <Renderer visible={!props.hideCustomer}>
                <Group justify="space-between">
                  <Text fz={em(15)}>{t`Customer`}</Text>
                  <Anchor fw={500} onClick={() => router.push(`/customers/${customer.code}`)}>
                    {customer.name}
                  </Anchor>
                </Group>

                <Group justify="space-between">
                  <Text fz={em(15)}>{t`Phone`}</Text>
                  <Text fz={em(15)} fw={500}>
                    {customer.phone || "--"}
                  </Text>
                </Group>
              </Renderer>

              {lastVersion.cidNumber && (
                <Group justify="space-between">
                  <Text fz={em(15)}>{t`CID number`}</Text>
                  <Text fz={em(15)} fw={500}>
                    {lastVersion.cidNumber}
                  </Text>
                </Group>
              )}

              {lastVersion.cidFullName && (
                <Group justify="space-between" wrap="nowrap">
                  <Text fz={em(15)}>{t`Full name`}</Text>
                  <Text fz={em(15)} fw={500} ta="right">
                    {lastVersion.cidFullName}
                  </Text>
                </Group>
              )}

              {lastVersion.cidVnLocation && Object.keys(lastVersion.cidVnLocation).length > 0 && (
                <Group justify="space-between">
                  <Text fz={em(15)}>{t`Address`}</Text>
                  <Text fz={em(15)} fw={500}>
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
                  <Text fz={em(13)}>{t`Front of CID`}</Text>
                  <EntityImage
                    w="100%"
                    src={lastVersion.frontOfCidImage}
                    onView={() => onView(0)}
                  />
                </Stack>

                <Stack gap={5}>
                  <Text fz={em(13)}>{t`Back of CID`}</Text>
                  <EntityImage w="100%" src={lastVersion.backOfCidImage} onView={() => onView(1)} />
                </Stack>

                <Stack gap={5}>
                  <Text fz={em(13)}>{t`Portrait image`}</Text>
                  <EntityImage w="100%" src={lastVersion.portraitImage} onView={() => onView(2)} />
                </Stack>
              </SimpleGrid>

              {(function () {
                if (kyc.status === CustomerKycStatus.APPROVED)
                  return (
                    <Stack align="end">
                      <Badge color="green">{t`Approved`}</Badge>
                    </Stack>
                  );

                if (kyc.status === CustomerKycStatus.REJECTED)
                  return (
                    <Stack align="end" gap={5}>
                      <Badge color="red">{t`Rejected`}</Badge>

                      <Text fz={em(13)} fw={500} c="red">
                        {t`Reason`}: {lastVersion.rejectReason || t`Unknown reason`}
                      </Text>
                    </Stack>
                  );

                if (!workspace.hasPermission(WorkspacePermission.CUSTOMER_KYCS_MANAGER))
                  return null;

                return (
                  <Group justify="end">
                    <Button leftIcon={IconCheck} onClick={onApprove}>
                      {t`Approve`}
                    </Button>

                    <Button variant="outline" color="gray" onClick={onReject}>
                      {t`Reject`}
                    </Button>
                  </Group>
                );
              })()}
            </Stack>
          </Card>
        );
      }}
    </ModalFileGallery>
  );
};

const ImageCard: FC<{
  url: string;
  onRemove?: () => void;
  disabled?: boolean;
  onGallery?: () => void;
  onClick?: () => void;
}> = (props) => {
  const { url } = props;
  const theme = useMantineTheme();
  const hover = useHover();

  return (
    <Card
      withBorder
      w="100%"
      p={5}
      style={{ position: "relative", overflow: "visible", cursor: "pointer" }}
    >
      <Stack w="100%" gap={5}>
        <Stack ref={hover.ref} style={{ position: "relative" }}>
          <Image src={url} w="100%" h={100} mih={100} mah={100} fit="contain" bg="gray.1" />

          {hover.hovered && (
            <Stack
              justify="center"
              align="center"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                top: 0,
                left: 0,
                borderRadius: theme.defaultRadius,
              }}
              onClick={props.onClick}
            >
              <ThemeIcon color="white" variant="transparent" size="sm">
                <IconArrowsDiagonal />
              </ThemeIcon>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
