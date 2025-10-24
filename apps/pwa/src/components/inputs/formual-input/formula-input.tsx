import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import React, { useState, useRef, useEffect } from "react";

interface Variable {
  name: string;
  description?: string;
  isNumerical?: boolean;
}

interface FormulaInputProps {
  value: string;
  onChange: (value: string) => void;
  variables: Variable[];
}

export const FormulaInput: React.FC<FormulaInputProps> = ({ value, onChange, variables }) => {
  const color = useColor();
  const colorScheme = useColorScheme();

  const primaryColor = color("primary");
  const primaryColorLight = color("primary.1");
  const descriptionColor = color("gray");
  const borderColor = "var(--mantine-color-default-border)";
  const backgroundColor =
    colorScheme === "light" ? "var(--mantine-color-white)" : "var(--mantine-color-dark-6)";
  const hoverBackgroundColor =
    colorScheme === "light" ? "var(--mantine-color-gray-0)" : "var(--mantine-color-dark-5)";

  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const previousFormulaModeRef = useRef<boolean | null>(null);

  // Check if the value is in formula format (starts with "=")
  const isFormulaMode = value.startsWith("=");

  // Detect mode switch and clear content when switching to formula mode
  useEffect(() => {
    const wasFormulaMode = previousFormulaModeRef.current;

    // Skip on initial mount (when wasFormulaMode is null)
    if (wasFormulaMode !== null) {
      // If switched from normal to formula mode, clear content
      if (!wasFormulaMode && isFormulaMode && value.length > 1) {
        onChange("=");
        if (editorRef.current) {
          editorRef.current.innerHTML = "=";
          // Set cursor after "="
          setTimeout(() => {
            if (editorRef.current) {
              const selection = window.getSelection();
              const range = document.createRange();
              const textNode = editorRef.current.firstChild;
              if (textNode && selection) {
                range.setStart(textNode, 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }, 0);
        }
      }
    }

    previousFormulaModeRef.current = isFormulaMode;
  }, [isFormulaMode, value, onChange]);

  // Filter variables based on formula mode and search term
  const filteredVariables = variables.filter((variable) => {
    // If in formula mode, only show numerical variables
    if (isFormulaMode && !variable.isNumerical) {
      return false;
    }
    // Filter by search term
    if (searchTerm) {
      return variable.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Convert string value to HTML with variable elements
  const stringToHtml = (text: string): string => {
    let html = "";
    let lastIndex = 0;

    const regex = /@(\w+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const variableName = match[1];
      const variable = variables.find((v) => v.name === variableName);

      // Add text before the variable
      if (match.index > lastIndex) {
        html += escapeHtml(text.substring(lastIndex, match.index));
      }

      // Add the variable as a styled span
      if (variable) {
        const tooltipText = variable.description || variableName;
        const titleAttr = `title="${escapeHtml(tooltipText)}"`;
        html += `<span class="variable" contenteditable="false" data-variable="${variableName}" ${titleAttr} style="background-color: ${primaryColorLight}; color: ${primaryColor};">${variableName}</span>\u200B`;
      } else {
        html += escapeHtml(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      html += escapeHtml(text.substring(lastIndex));
    }

    return html || "";
  };

  // Convert editor HTML content back to string
  const htmlToString = (element: HTMLDivElement): string => {
    let result = "";

    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Filter out zero-width spaces
        const text = (node.textContent || "").replace(/\u200B/g, "");
        result += text;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        if (el.classList.contains("variable")) {
          const varName = el.getAttribute("data-variable");
          result += `@${varName}`;
        } else if (el.tagName === "BR") {
          result += "\n";
        } else {
          // Traverse children
          node.childNodes.forEach(traverse);
        }
      }
    };

    element.childNodes.forEach(traverse);
    return result;
  };

  // Escape HTML special characters
  const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // Initialize and update editor content when value changes externally
  useEffect(() => {
    if (!editorRef.current || isComposingRef.current) return;

    const currentContent = htmlToString(editorRef.current);

    // Only update if the content actually differs
    if (currentContent !== value) {
      const selection = window.getSelection();
      const hadFocus = document.activeElement === editorRef.current;
      let cursorOffset = 0;

      // Try to save cursor position if element has focus
      if (
        hadFocus &&
        selection?.rangeCount &&
        editorRef.current.contains(selection.getRangeAt(0).startContainer)
      ) {
        cursorOffset = getCursorOffset(editorRef.current);
      }

      editorRef.current.innerHTML = stringToHtml(value);

      // Restore cursor position if element had focus
      if (hadFocus && cursorOffset > 0) {
        setTimeout(() => {
          if (editorRef.current) {
            setCursorOffset(editorRef.current, cursorOffset);
          }
        }, 0);
      }
    }
  }, [value, variables]);

  // Handle input changes
  const handleInput = () => {
    if (!editorRef.current) return;

    const newValue = htmlToString(editorRef.current);
    onChange(newValue);

    // Check for "@" trigger
    checkForVariableTrigger();
  };

  // Handle copy event - convert selection to clean string format
  const handleCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Create a temporary div to hold the selected content
    const container = document.createElement("div");

    // Get all ranges in the selection
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      const clonedContent = range.cloneContents();
      container.appendChild(clonedContent);
    }

    // Convert the cloned content to string format
    const textToCopy = htmlToString(container);

    // Set clipboard data
    e.clipboardData.setData("text/plain", textToCopy);
  };

  // Handle cut event - copy and then delete selection
  const handleCut = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Create a temporary div to hold the selected content
    const container = document.createElement("div");

    // Get all ranges in the selection
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      const clonedContent = range.cloneContents();
      container.appendChild(clonedContent);
    }

    // Convert the cloned content to string format
    const textToCopy = htmlToString(container);

    // Set clipboard data
    e.clipboardData.setData("text/plain", textToCopy);

    // Delete the selected content
    selection.deleteFromDocument();

    // Update value
    if (editorRef.current) {
      const newValue = htmlToString(editorRef.current);
      onChange(newValue);
    }
  };

  // Check if user is typing a variable
  const checkForVariableTrigger = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) {
      setShowDropdown(false);
      savedRangeRef.current = null;
      return;
    }

    const textContent = textNode.textContent || "";
    const cursorOffset = range.startOffset;
    const textBeforeCursor = textContent.substring(0, cursorOffset);

    // Find the last "@" before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        // Save the current range for later use
        savedRangeRef.current = range.cloneRange();

        setSearchTerm(textAfterAt);
        setShowDropdown(true);
        setSelectedIndex(0);

        // Calculate dropdown position
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
          setDropdownPosition({
            top: rect.bottom - containerRect.top + 5,
            left: rect.left - containerRect.left,
          });
        }
        return;
      }
    }

    setShowDropdown(false);
    setSearchTerm("");
    savedRangeRef.current = null;
  };

  // Handle variable selection
  const insertVariable = (variable: Variable) => {
    if (!editorRef.current) return;

    // Use saved range if available, otherwise try to get current selection
    let range = savedRangeRef.current;

    if (!range) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      range = selection.getRangeAt(0);
    }

    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const textContent = textNode.textContent || "";
    const cursorOffset = range.startOffset;
    const textBeforeCursor = textContent.substring(0, cursorOffset);

    // Find the last "@" before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Create variable span element
      const variableSpan = document.createElement("span");
      variableSpan.className = "variable";
      variableSpan.contentEditable = "false";
      variableSpan.setAttribute("data-variable", variable.name);
      variableSpan.setAttribute("title", variable.description || variable.name);
      variableSpan.textContent = variable.name;

      // Split the text node
      const beforeText = textContent.substring(0, lastAtIndex);
      const afterText = textContent.substring(cursorOffset);

      // Replace content
      const beforeNode = document.createTextNode(beforeText);
      const zeroWidthSpace = document.createTextNode("\u200B"); // Zero-width space for cursor
      const afterNode = document.createTextNode(afterText);

      const parent = textNode.parentNode;
      if (parent) {
        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(variableSpan, textNode);
        parent.insertBefore(zeroWidthSpace, textNode);
        parent.insertBefore(afterNode, textNode);
        parent.removeChild(textNode);

        // Set cursor after variable (in the zero-width space)
        const selection = window.getSelection();
        if (selection) {
          const newRange = document.createRange();
          newRange.setStart(zeroWidthSpace, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }

      // Update value
      const newValue = htmlToString(editorRef.current);
      onChange(newValue);
    }

    setShowDropdown(false);
    setSearchTerm("");
    savedRangeRef.current = null;
  };

  // Scroll dropdown to show selected item
  const scrollToSelectedItem = (index: number) => {
    if (!dropdownRef.current) return;

    const dropdown = dropdownRef.current;
    const items = dropdown.querySelectorAll(".dropdown-item");
    const selectedItem = items[index] as HTMLElement;

    if (selectedItem) {
      const dropdownRect = dropdown.getBoundingClientRect();
      const itemRect = selectedItem.getBoundingClientRect();

      // Check if item is below visible area
      if (itemRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += itemRect.bottom - dropdownRect.bottom;
      }
      // Check if item is above visible area
      else if (itemRect.top < dropdownRect.top) {
        dropdown.scrollTop -= dropdownRect.top - itemRect.top;
      }
    }
  };

  // Handle keyboard navigation in dropdown and variable deletion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent entering "=" when already in formula mode
    if (e.key === "=" && isFormulaMode) {
      e.preventDefault();
      return;
    }

    // Handle dropdown navigation
    if (showDropdown) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev < filteredVariables.length - 1 ? prev + 1 : prev;
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
          return;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : 0;
            setTimeout(() => scrollToSelectedItem(newIndex), 0);
            return newIndex;
          });
          return;
        case "Enter":
          e.preventDefault();
          if (filteredVariables[selectedIndex]) {
            insertVariable(filteredVariables[selectedIndex]);
          }
          return;
        case "Escape":
          e.preventDefault();
          setShowDropdown(false);
          setSearchTerm("");
          savedRangeRef.current = null;
          return;
      }
    }

    // Handle backspace - remove entire variable element if cursor is adjacent to it
    if (e.key === "Backspace" && editorRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // Check if previous sibling is a variable span
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = range.startContainer as Text;
        if (range.startOffset === 0 && textNode.previousSibling) {
          const prevElement = textNode.previousSibling as HTMLElement;
          if (prevElement.classList?.contains("variable")) {
            e.preventDefault();
            prevElement.remove();
            handleInput();
            return;
          }
        }
      } else if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        const container = range.startContainer as HTMLElement;
        const prevElement = container.childNodes[range.startOffset - 1] as HTMLElement;
        if (prevElement?.classList?.contains("variable")) {
          e.preventDefault();
          prevElement.remove();
          handleInput();
          return;
        }
      }
    }

    // Handle delete - remove entire variable element if cursor is adjacent to it
    if (e.key === "Delete" && editorRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // Check if next sibling is a variable span
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = range.startContainer as Text;
        const textContent = textNode.textContent || "";
        if (range.startOffset === textContent.length && textNode.nextSibling) {
          const nextElement = textNode.nextSibling as HTMLElement;
          if (nextElement.classList?.contains("variable")) {
            e.preventDefault();
            nextElement.remove();
            handleInput();
            return;
          }
        }
      } else if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        const container = range.startContainer as HTMLElement;
        const nextElement = container.childNodes[range.startOffset] as HTMLElement;
        if (nextElement?.classList?.contains("variable")) {
          e.preventDefault();
          nextElement.remove();
          handleInput();
          return;
        }
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        savedRangeRef.current = null;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1 }}>
      <style>{`
        .formula-editor {
          width: 100%;
          padding: 0.4rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid ${borderColor};
          border-radius: 0.5rem;
          outline: none;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .formula-editor:focus {
          border-color: ${primaryColor};
        }
        .formula-editor:empty:before {
          content: attr(data-placeholder);
          color: ${descriptionColor};
          pointer-events: none;
        }
        .formula-editor .variable {
          background-color: ${primaryColorLight};
          color: ${primaryColor};
          padding: 4px;
          margin: 0 1px;
          border-radius: 4px;
          font-size: 0.70rem;
          font-weight: 600;
          cursor: help;
          user-select: none;
          display: inline-block;
          pointer-events: auto;
          position: relative;
          vertical-align: baseline;
          line-height: 1;
        }
        .formula-editor .variable:hover {
          opacity: 0.8;
        }
        .formula-editor .variable::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: normal;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          margin-bottom: 4px;
          z-index: 10000;
        }
        .formula-editor .variable:hover::after {
          opacity: 1;
        }
      `}</style>

      {/* ContentEditable div for input */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCopy={handleCopy}
        onCut={handleCut}
        onCompositionStart={() => (isComposingRef.current = true)}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          handleInput();
        }}
        className="formula-editor"
        data-placeholder={
          isFormulaMode ? "Enter formula (e.g., =@revenue - @cost)" : "Enter text or @variable"
        }
      />

      {showDropdown && filteredVariables.length > 0 && (
        <div
          ref={dropdownRef}
          onMouseDown={(e) => {
            // Prevent editor from losing focus when clicking dropdown
            e.preventDefault();
          }}
          style={{
            position: "absolute",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: backgroundColor,
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            minWidth: "250px",
            maxWidth: "400px",
          }}
        >
          {filteredVariables.map((variable, index) => (
            <div
              key={variable.name}
              className="dropdown-item"
              onClick={() => insertVariable(variable)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: index === selectedIndex ? hoverBackgroundColor : backgroundColor,
                borderBottom:
                  index < filteredVariables.length - 1 ? `1px solid ${borderColor}` : "none",
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{ fontWeight: "500", fontSize: "14px" }}>
                @{variable.name}
                {variable.isNumerical && (
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "11px",
                      color: descriptionColor,
                      fontWeight: "normal",
                    }}
                  >
                    (numerical)
                  </span>
                )}
              </div>
              {variable.description && (
                <div
                  style={{
                    fontSize: "12px",
                    color: descriptionColor,
                    marginTop: "2px",
                  }}
                >
                  {variable.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && filteredVariables.length === 0 && (
        <div
          ref={dropdownRef}
          onMouseDown={(e) => {
            // Prevent editor from losing focus when clicking dropdown
            e.preventDefault();
          }}
          style={{
            position: "absolute",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            backgroundColor: backgroundColor,
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            minWidth: "250px",
            padding: "8px 12px",
          }}
        >
          <div style={{ fontSize: "14px", color: descriptionColor }}>
            {isFormulaMode ? "No numerical variables found" : "No variables found"}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get cursor offset from start of element
function getCursorOffset(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  return preCaretRange.toString().length;
}

// Helper function to set cursor position by offset
function setCursorOffset(element: HTMLElement, offset: number) {
  const selection = window.getSelection();
  if (!selection) return;

  let currentOffset = 0;
  let found = false;

  const traverse = (node: Node): boolean => {
    if (found) return true;

    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      if (currentOffset + textLength >= offset) {
        const range = document.createRange();
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        found = true;
        return true;
      }
      currentOffset += textLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains("variable")) {
        const varName = el.getAttribute("data-variable");
        const textLength = (varName?.length || 0) + 1; // +1 for @
        if (currentOffset + textLength >= offset) {
          // Place cursor after the variable
          const range = document.createRange();
          range.setStartAfter(el);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          found = true;
          return true;
        }
        currentOffset += textLength;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (traverse(node.childNodes[i])) return true;
        }
      }
    }

    return false;
  };

  traverse(element);
}
