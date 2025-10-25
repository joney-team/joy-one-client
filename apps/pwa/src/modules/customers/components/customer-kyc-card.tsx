"use client";

import { useRouter } from "@/hooks/use-router";
import { onActionLoad } from "@/utils/actions";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { OnModalPrompt } from "@/modals/modal-prompt";
import {
  approveCustomerKyc,
  rejectCustomerKyc,
} from "@/modules/customer-kycs/customer-kycs-service";
import {
  type CustomerKycEntity,
  CustomerKycStatus,
} from "@/modules/customer-kycs/customer-kycs-types";
import { FileType } from "@/modules/files/file-types";
import { renderDateTime, tl } from "@/modules/lang/lang-service";
import { String } from "@/utils/string.utils";
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
import { Image } from "../../../components/image";
import { EntityImage } from "../../../components/entity-image";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Renderer } from "../../../components/renderer";
import { useLocations } from "@/modules/locations/locations-context";

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

  const onView = (index = 0) => {
    OnModalFileGallery({
      index,
      disabled: true,
      files: [
        {
          url: lastVersion.frontOfCidImage,
          _id: "1",
          fileName: tl("frontOfCidImage"),
          type: FileType.PHOTO,
        },
        {
          url: lastVersion.backOfCidImage,
          _id: "2",
          fileName: tl("backOfCidImage"),
          type: FileType.PHOTO,
        },
        {
          url: lastVersion.portraitImage,
          _id: "3",
          fileName: tl("portraitImage"),
          type: FileType.PHOTO,
        },
      ],
    });
  };

  const onApprove = async () => {
    await onActionLoad({
      name: tl("approve"),
      process: async () => {
        const _kyc = await approveCustomerKyc(customer._id);
        props.onApproved?.(_kyc);
      },
    });
  };

  const onReject = () => {
    OnModalPrompt({
      title: String.capitalizeFirstLetter(`${tl("reject")} ${tl("customer-kyc")}`),
      message: tl("enter_reject_reason"),
      onSubmit: (reason) => rejectCustomerKyc(customer._id, { reason }),
      icon: IconUserScan,
      color: "red",
      suggestions: [tl("wrong_information"), tl("info_does_not_match_img"), tl("img_is_blurry")],
    });
  };

  return (
    <Card className="CustomerKycCard" withBorder shadow="none" {...props.cardProps}>
      <Stack align="stretch">
        <Text fz={em(12)}>{renderDateTime(lastVersion.createdAt, true)}</Text>

        <Renderer visible={!props.hideCustomer}>
          <Group justify="space-between">
            <Text fz={em(15)}>{tl("customer")}</Text>
            <Anchor fw={500} onClick={() => router.push(`/customers/${customer.code}`)}>
              {customer.name}
            </Anchor>
          </Group>

          <Group justify="space-between">
            <Text fz={em(15)}>{tl("phone")}</Text>
            <Text fz={em(15)} fw={500}>
              {customer.phone || "--"}
            </Text>
          </Group>
        </Renderer>

        {lastVersion.cidNumber && (
          <Group justify="space-between">
            <Text fz={em(15)}>{tl("cidNumber")}</Text>
            <Text fz={em(15)} fw={500}>
              {lastVersion.cidNumber}
            </Text>
          </Group>
        )}

        {lastVersion.cidFullName && (
          <Group justify="space-between" wrap="nowrap">
            <Text fz={em(15)}>{tl("cidFullName")}</Text>
            <Text fz={em(15)} fw={500} ta="right">
              {lastVersion.cidFullName}
            </Text>
          </Group>
        )}

        {lastVersion.cidVnLocation && Object.keys(lastVersion.cidVnLocation).length > 0 && (
          <Group justify="space-between">
            <Text fz={em(15)}>{tl("address")}</Text>
            <Text fz={em(15)} fw={500}>
              {renderLocation(lastVersion.cidVnLocation, { shortProvine: true, shortWard: true })}
            </Text>
          </Group>
        )}

        <Divider />

        <SimpleGrid cols={{ md: 3 }}>
          <Stack gap={5}>
            <Text fz={em(13)}>{tl("frontOfCidImage")}</Text>
            <EntityImage w="100%" src={lastVersion.frontOfCidImage} onView={() => onView(0)} />
          </Stack>

          <Stack gap={5}>
            <Text fz={em(13)}>{tl("backOfCidImage")}</Text>
            <EntityImage w="100%" src={lastVersion.backOfCidImage} onView={() => onView(1)} />
          </Stack>

          <Stack gap={5}>
            <Text fz={em(13)}>{tl("portraitImage")}</Text>
            <EntityImage w="100%" src={lastVersion.portraitImage} onView={() => onView(2)} />
          </Stack>
        </SimpleGrid>

        {(function () {
          if (kyc.status === CustomerKycStatus.APPROVED)
            return (
              <Stack align="end">
                <Badge color="green">{tl("approved")}</Badge>
              </Stack>
            );

          if (kyc.status === CustomerKycStatus.REJECTED)
            return (
              <Stack align="end" gap={5}>
                <Badge color="red">{tl("rejected")}</Badge>

                <Text fz={em(13)} fw={500} c="red">
                  {tl("reason")}: {lastVersion.rejectReason || tl("unknown_reason")}
                </Text>
              </Stack>
            );

          if (!workspace.hasPermission(WorkspacePermission.CUSTOMER_KYCS_MANAGER)) return null;

          return (
            <Group justify="end">
              <Button leftIcon={IconCheck} onClick={onApprove}>
                {tl("approve")}
              </Button>

              <Button variant="outline" color="gray" onClick={onReject}>
                {tl("reject")}
              </Button>
            </Group>
          );
        })()}
      </Stack>
    </Card>
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
