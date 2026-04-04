import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Card, Group, NumberInput } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { type FC } from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number | null;
  min?: number;
}

export const QuantityInput: FC<QuantityInputProps> = ({ value, onChange, min, ...rest }) => {
  const step = rest.step ?? 1;
  const color = useColor();

  const isCanDescrease = min ? value - step >= min : true;

  const onDecrease = () => {
    const _value = value - step;
    if (min && _value <= min) return;
    onChange(_value);
  };

  const onIncrease = () => {
    onChange(value + 1);
  };

  return (
    <Card
      py={0}
      px={3}
      bg="gray.1"
      shadow="none"
      style={{
        borderRadius: 100,
      }}
    >
      <Group wrap="nowrap" gap={0}>
        <ActionIcon disabled={!isCanDescrease} color="gray.4" radius={100} onClick={onDecrease}>
          <IconMinus size={16} strokeWidth={1.5} />
        </ActionIcon>

        <NumberInput
          hideControls
          value={value}
          onChange={(value) => {
            if (!value || Number.isNaN(value) || +value <= 0) return;
            onChange(+value);
          }}
          min={0}
          maw={60}
          step={step}
          styles={{
            input: {
              textAlign: "center",
              background: "none",
              border: "none",
              boxShadow: "none",
              padding: 0,
            },
          }}
          onBlur={(e) => {
            const value = e.target.value;
            if (+value === 0) onChange(0);
          }}
        />

        <ActionIcon color={color("primary.3")} radius={100} onClick={onIncrease}>
          <IconPlus size={16} strokeWidth={1.5} />
        </ActionIcon>
      </Group>
    </Card>
  );
};
