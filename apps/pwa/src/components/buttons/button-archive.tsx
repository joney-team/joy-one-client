import { useRouter } from "@/hooks/use-router";
import { onArchive } from "@/utils/actions";
import { t } from "@/modules/lang/lang-service";
import { Button, Center, Text } from "@mantine/core";
import { IconArchive } from "@tabler/icons-react";
import { FC } from "react";

interface ButtonArchiveProps {
  enabled?: boolean;
  mt?: number;
  name?: string;
  onClick?: () => void;
  process?: () => Promise<any> | any;
  onArchived?: () => void;
  goBackWhenArchived?: boolean;
  label?: string;
}

export const ButtonArchive: FC<ButtonArchiveProps> = (props) => {
  const router = useRouter();
  const goBackWhenArchived = typeof props.goBackWhenArchived === "boolean" ? props.goBackWhenArchived : true;

  if (props.enabled === false) return null;

  return (
    <Center mt={props.mt}>
      <Button
        h={25}
        variant="subtle"
        color="gray.5"
        leftSection={<IconArchive strokeWidth={1.3} size={16} style={{ marginRight: -5 }} />}
        onClick={() => {
          if (props.onClick) return props.onClick();
          if (props.process)
            return onArchive({
              name: props.name,
              process: () => props.process?.(),
              onArchived: () => {
                if (props.onArchived) props.onArchived();
                if (goBackWhenArchived) router.back();
              },
            });
        }}
      >
        <Text fz={12} fw={400}>
          {t(props.label || "archive")}
        </Text>
      </Button>
    </Center>
  );
};
