import { capitalizeFirstLetter } from "@joy-one-client/utils/string";
import React from "react";
import ReactDOMServer from 'react-dom/server';
import { Column } from "./types";

export const getIn = (obj: any, path: string) => {
  try {
    var paths = path.split('.')
      , current = obj
      , i;

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] == undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }

    return current;
  } catch (e) {
    return undefined;
  }
}

export const getValuePath = (key: string, column: Column<any, any>) => {
  return column.valuePath || key;
}

export const getColumnLabel = (key: string, column: Column<any, any>) => {
  return column.name || key;
}

export function extractTextFromComponent<P = any>(
  Component: React.ComponentType<P>,
  props?: P
): string {
  try {
    // Render the component to an HTML string
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Component as any, props || {})
    );

    // Create a temporary DOM element to parse the HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // Extract the text content
    const textContent = tempElement.textContent || '';

    // Clean up
    tempElement.remove();

    return textContent;
  } catch (error) {
    console.error('Error extracting text from component:', error);
    return '';
  }
}

export function getTextFromReactNode(node: React.ReactNode): string {
  if (node === null || node === undefined) {
    return '';
  }

  // Handle strings and numbers directly
  if (typeof node === 'string' || typeof node === 'number') {
    return node.toString();
  }

  // Handle arrays (like multiple children)
  if (Array.isArray(node)) {
    return node.map(getTextFromReactNode).join('');
  }

  // Handle React elements
  if (React.isValidElement(node)) {
    const { children } = node.props as any;
    return getTextFromReactNode(children);
  }

  // Handle other object types that might represent text (like in React Fragments)
  if (typeof node === 'object') {
    const nodeObj = node as any;
    if (nodeObj.props?.children) {
      return getTextFromReactNode(nodeObj.props.children);
    }
  }

  // Default case
  return '';
}

export function getListDataId<T = any>(data: T): string {
  if (data && typeof data === "object") {
    if ("id" in data && typeof data.id === "string") return data.id;
    if ("_id" in data && typeof data._id === "string") return data._id;
  }

  return "";
}

export function getSortQueryKey(colId: string) {
  return `sort${capitalizeFirstLetter(colId)}`;
}