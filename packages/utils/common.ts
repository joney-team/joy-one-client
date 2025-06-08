export const isServer = () => typeof window === 'undefined';

export function placeCaretAtEnd(el: HTMLElement) {
  el.focus();
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(el, el.childNodes.length);
  range.collapse(true);
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export const classNames = (...classes: (string | { [key: string]: boolean })[]): string => {
  return classes.map(c => {
    if (typeof c === 'string') return c;
    return Object.keys(c).filter(key => c[key]).join(' ');
  }).join(' ');
}