"use client";

import { ReactionType } from "@/graphql/enums.graphql";
import { MantineColor } from "@mantine/core";

import angryIcon from "./icons/angry.svg";
import dislikeIcon from "./icons/dislike.svg";
import eyesIcon from "./icons/eyes.svg";
import laughIcon from "./icons/laugh.svg";
import likeIcon from "./icons/like.svg";
import loveIcon from "./icons/love.svg";
import sadIcon from "./icons/sad.svg";
import surpriseIcon from "./icons/surprise.svg";

export const reactionTypes: Record<ReactionType, { color: MantineColor; iconSrc: string }> = {
  [ReactionType.Like]: {
    color: "yellow",
    iconSrc: likeIcon,
  },
  [ReactionType.Love]: { color: "red", iconSrc: loveIcon },
  [ReactionType.Laugh]: { color: "orange", iconSrc: laughIcon },
  [ReactionType.Eyes]: { color: "blue", iconSrc: eyesIcon },
  [ReactionType.Angry]: { color: "green", iconSrc: angryIcon },
  [ReactionType.Sad]: { color: "gray", iconSrc: sadIcon },
  [ReactionType.Surprise]: { color: "violet", iconSrc: surpriseIcon },
  [ReactionType.Dislike]: { color: "gray", iconSrc: dislikeIcon },
};
