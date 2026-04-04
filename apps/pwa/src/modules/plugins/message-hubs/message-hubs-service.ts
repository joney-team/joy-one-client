import { PluginMessageHubInput } from "@/graphql/types.graphql";
import { PluginMessageHubFragment } from "./graphql/fragmentPluginMessageHub.graphql";

export function normalizeMessageHubInput(
  messageHub: PluginMessageHubFragment,
): PluginMessageHubInput {
  return {
    name: messageHub.name,
    widgetSettings: {
      color: messageHub.widgetSettings.color,
      position: messageHub.widgetSettings.position,
      chatIcon: messageHub.widgetSettings.chatIcon,
      locale: messageHub.widgetSettings.locale,
      brandName: messageHub.widgetSettings.brandName,
      brandLogo: messageHub.widgetSettings.brandLogo,
      welcomMessage: messageHub.widgetSettings.welcomMessage,
      welcomSubMessage: messageHub.widgetSettings.welcomSubMessage,
      welcomeInputs: messageHub.widgetSettings.welcomeInputs?.map((input) => ({
        id: input.id,
        fieldName: input.fieldName,
        type: input.type,
        label: input.label,
        description: input.description,
        placeholder: input.placeholder,
        isRequired: input.isRequired,
      })),
    },
  };
}
