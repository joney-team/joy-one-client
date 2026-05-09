import { AppEntity } from '../app.types';

interface TiptapDoc {
  type: 'doc';
  content?: TiptapNode[];
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
}

type MentionId = string;

export function extractMentionedIds(
  doc: TiptapDoc,
  entity: AppEntity,
): MentionId[] {
  const result = new Set<MentionId>();

  function traverse(nodes?: TiptapNode[]) {
    if (!nodes) return;

    for (const node of nodes) {
      if (
        node.type === 'mention' &&
        node.attrs &&
        node.attrs['id'] &&
        node.attrs['entity'] === entity
      ) {
        result.add(node.attrs['id']);
      }

      if (node.content?.length) {
        traverse(node.content);
      }
    }
  }

  traverse(doc.content);

  return Array.from(result);
}

export function diffMentionedIds(prev: string[], next: string[]) {
  const prevIds = new Set(prev);
  const nextIds = new Set(next);

  return {
    added: [...nextIds].filter((id) => !prevIds.has(id)),
    removed: [...prevIds].filter((id) => !nextIds.has(id)),
  };
}
