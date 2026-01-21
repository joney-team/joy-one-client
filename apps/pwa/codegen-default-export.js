function capitalizeFirstLetter(string) {
  if (!string) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  plugin(_schema, documents) {
    return documents
      .map((d) => {
        const definition = d.document?.definitions[0];
        if (!definition || !('name' in definition)) {
          return '';
        }

        const name = definition.name?.value;
        
        // Handle fragments
        if (definition.kind === 'FragmentDefinition') {
          return `
import { TypedDocumentNode } from '@apollo/client/core';
export const ${name}Document = (import("graphql").DocumentNode) as TypedDocumentNode<${name}Fragment>;
export default ${name}Document `;
        }
        
        // Handle operations (query, mutation, subscription)
        if ('operation' in definition) {
          const operation = capitalizeFirstLetter(definition.operation);
          return `
import { TypedDocumentNode } from '@apollo/client/core';
export const ${name}Document = (import("graphql").DocumentNode) as TypedDocumentNode<${name}${operation}, ${name}${operation}Variables>;
export default ${name}Document `;
        }

        return '';
      })
      .join('\n');
  },
};
