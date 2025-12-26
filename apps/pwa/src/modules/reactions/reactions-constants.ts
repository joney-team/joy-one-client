import { ReactionType } from "@/graphql/enums.graphql";
import {
  Icon,
  IconConfettiFilled,
  IconEye,
  IconHeartFilled,
  IconMoodSmileFilled,
  IconThumbUpFilled,
} from "@tabler/icons-react";

export const reactionTypes: Record<ReactionType, { color: string; icon: Icon }> = {
  [ReactionType.Like]: { color: "yellow", icon: IconThumbUpFilled },
  [ReactionType.Celebrate]: { color: "green", icon: IconConfettiFilled },
  [ReactionType.Eyes]: { color: "blue", icon: IconEye },
  [ReactionType.Laugh]: { color: "orange", icon: IconMoodSmileFilled },
  [ReactionType.Love]: { color: "red", icon: IconHeartFilled },
};
