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