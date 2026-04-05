"use client";

import { ReactionType } from "@/graphql/enums.graphql";
import { ReactionsCount } from "@/graphql/types.graphql";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { getId } from "@joy-one-client/utils/base-data";
import { type DocumentNode } from "graphql";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../auth/auth-context";
import AddReactionDocument from "./graphql/addReaction.graphql";
import RemoveReactionDocument from "./graphql/removeReaction.graphql";
import { reactionTypes } from "./reactions-constants";

type DataWithReactions = {
  __typename: string;
  reactionsCount?: ReactionsCount;
} & ({ _id: string } | { id: string });

export const useReactions = <T extends DataWithReactions>(args: {
  entity: AppEntity;
  fragment: DocumentNode;
  fragmentName?: string;
  fragmentData: T;
}) => {
  const client = useApolloClient();
  const { user } = useAuth();
  const fragmentName = args.fragmentName ?? `${args.fragmentData.__typename}`;

  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);

  const reactions = useMemo(() => {
    const userReactions =
      args.fragmentData.reactionsCount?.reactions.filter((reaction) =>
        reaction.userIds.includes(user?._id),
      ) ?? [];

    const otherReactions =
      args.fragmentData.reactionsCount?.reactions.filter(
        (reaction) => !reaction.userIds.includes(user?._id) && reaction.count > 0,
      ) ?? [];

    return { userReactions, otherReactions };
  }, [args.fragmentData.reactionsCount]);

  const entityId = getId(args.fragmentData);

  const [addReaction] = useMutation(AddReactionDocument);
  const [removeReaction] = useMutation(RemoveReactionDocument);

  const cacheIdentifiedId = client.cache.identify(
    Object.assign(
      {
        __typename: args.fragmentData.__typename,
      },
      "_id" in args.fragmentData ? { _id: args.fragmentData._id } : { id: args.fragmentData.id },
    ),
  );

  const handleAddReaction = async (type: ReactionType, options?: { onSuccess?: () => unknown }) => {
    try {
      setIsAddLoading(true);
      await addReaction({
        variables: {
          entity: args.entity,
          entityId,
          type,
        },
      });

      client.cache.updateFragment<T>(
        {
          id: cacheIdentifiedId,
          fragment: args.fragment,
          fragmentName,
        },
        (prev) => {
          if (!prev || !prev.reactionsCount) return prev;

          return {
            ...prev,
            reactionsCount: {
              ...prev.reactionsCount,
              reactions: prev.reactionsCount.reactions.map((reaction) =>
                reaction.type === type
                  ? {
                      ...reaction,
                      count: reaction.count + 1,
                      userIds: [...reaction.userIds, user._id],
                    }
                  : reaction,
              ),
            },
          };
        },
      );

      await options?.onSuccess?.();
    } catch (error) {
      onError(error);
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleRemoveReaction = useCallback(
    async (type: ReactionType) => {
      try {
        if (!reactions.userReactions?.length) {
          return;
        }

        setIsRemoveLoading(true);
        await removeReaction({
          variables: {
            entity: args.entity,
            entityId,
            type,
          },
        });

        client.cache.updateFragment<T>(
          {
            id: cacheIdentifiedId,
            fragment: args.fragment,
            fragmentName,
          },
          (prev) => {
            if (!prev || !prev.reactionsCount) return prev;

            return {
              ...prev,
              reactionsCount: {
                ...prev.reactionsCount,
                reactions: prev.reactionsCount.reactions.map((reaction) =>
                  reaction.type === type
                    ? {
                        ...reaction,
                        count: reaction.count - 1,
                        userIds: reaction.userIds.filter((userId) => userId !== user._id),
                      }
                    : reaction,
                ),
              },
            };
          },
        );
      } catch (error) {
        onError(error);
      } finally {
        setIsRemoveLoading(false);
      }
    },
    [
      args.entity,
      args.fragment,
      fragmentName,
      cacheIdentifiedId,
      reactions.userReactions,
      removeReaction,
      user._id,
      entityId,
    ],
  );

  const availableReactions = useMemo(() => {
    return Object.keys(reactionTypes).filter((type) => {
      return !reactions.userReactions?.some((reaction) => reaction.type === type);
    }) as ReactionType[];
  }, [reactions.userReactions]);

  return {
    ...reactions,
    handleAddReaction,
    handleRemoveReaction,
    isAddLoading,
    isRemoveLoading,
    availableReactions,
  };
};
