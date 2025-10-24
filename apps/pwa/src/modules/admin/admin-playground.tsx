import { FormulaInput } from "@/components/inputs/formual-input/formula-input";
import { Stack, Text, Code, Paper, TextInput } from "@mantine/core";
import { useState, type FC } from "react";

export const AdminPlayground: FC = () => {
  const [value, setValue] = useState("= @receiptAmount");

  return (
    <Stack p={30} gap={20}>
      <Text size="lg" fw={600} mb={10}>
        Formula Input Demo
      </Text>
      <FormulaInput
        value={value}
        onChange={setValue}
        variables={[
          { name: "revenue", description: "Total revenue amount", isNumerical: true },
          { name: "cost", description: "Total cost amount", isNumerical: true },
          { name: "profit", description: "Total profit amount", isNumerical: true },
          { name: "customerName", description: "Name of customer" },
          { name: "email", description: "Customer email address" },
          { name: "receiptAmount", description: "Amount of receipt", isNumerical: true },
        ]}
      />

      <Paper p={16} withBorder>
        <Text size="sm" fw={600} mb={8}>
          Output String Value:
        </Text>
        {/* <Code block>{value || "(empty)"}</Code> */}
        <TextInput value={value} readOnly />
      </Paper>

      <Paper p={16} withBorder>
        <Text size="sm" fw={600} mb={8}>
          Tips:
        </Text>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Type @ to see variable suggestions</li>
          <li>Start with = for formula mode (only numerical variables)</li>
          <li>Switching to formula mode (=) clears all content</li>
          <li>Cannot type = inside formula mode (clear all first)</li>
          <li>Variables are highlighted and @ symbol is hidden</li>
          <li>Hover over variables to see their descriptions (tooltip)</li>
          <li>Backspace/Delete removes entire variable</li>
          <li>Use ↑↓ arrow keys to navigate dropdown (auto-scroll)</li>
          <li>Copy/Cut converts selection to @variable format</li>
        </ul>
      </Paper>
    </Stack>
  );
};
