import { Renderer } from "@/components/renderer";
import { PartnerSelector } from "@/modules/partners/components/partner-selector";
import { ActionIcon, Group, InputWrapperProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { PartnerFragment } from "../graphql/fragmentPartner.graphql";
import { PartnerCard } from "./partner-card";

interface PartnersInputProps extends Omit<
  InputWrapperProps,
  "value" | "onChange" | "onSelect" | "target"
> {
  value?: PartnerFragment[];
  onChange?: (value: PartnerFragment[]) => void;
}

export const PartnersInput: FC<PartnersInputProps> = (props) => {
  const { value, onChange, ...rest } = props;

  const partners = value || [];

  const toogleSelect = (partner?: PartnerFragment | null) => {
    if (!partner) return;

    const index = props.value?.findIndex((u) => u._id === partner._id);
    if (index === -1) {
      props.onChange?.([...partners, partner]);
    } else {
      props.onChange?.(partners.filter((u) => u._id !== partner._id));
    }
  };

  return (
    <PartnerSelector
      {...rest}
      excludeIds={partners.map((p) => p._id)}
      onSelect={toogleSelect}
      target={(ctx) => {
        return (
          <Group
            gap={10}
            py={1}
            flex={props.flex}
            style={{ cursor: "pointer" }}
            onClick={ctx.toggle}
          >
            {partners.map((partner) => {
              return (
                <PartnerCard
                  partner={partner}
                  onRemove={props.onChange ? () => toogleSelect(partner) : undefined}
                  key={partner._id}
                />
              );
            })}

            <Renderer visible={!!props.onChange}>
              <ActionIcon color="gray.4" size={34} variant="outline" radius={100}>
                <IconPlus strokeWidth={1.5} size={18} />
              </ActionIcon>
            </Renderer>
          </Group>
        );
      }}
    />
  );
};
