import { PartnerEntity } from "@/modules/partners/partners-types";
import { ActionIcon, Group, InputWrapperProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { PartnerCard } from "./partner-card";
import { Renderer } from "@/components/renderer";
import { PartnerSelector } from "@/modules/partners/partner-selector";

interface PartnersInputProps extends Omit<InputWrapperProps, "value" | "onChange" | "onSelect" | "renderTrigger"> {
  value?: PartnerEntity[];
  onChange?: (value: PartnerEntity[]) => void;
}

export const PartnersInput: FC<PartnersInputProps> = (props) => {
  const { value, onChange, ...rest } = props;

  const partners = value || [];

  const toogleSelect = (partner?: PartnerEntity) => {
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
      renderTrigger={(ctx) => {
        return (
          <Group gap={10} py={1} flex={props.flex} style={{ cursor: "pointer" }} onClick={ctx.toggle}>
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
