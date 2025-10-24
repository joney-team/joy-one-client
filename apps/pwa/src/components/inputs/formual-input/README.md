# FormulaInput Component Documentation

## Overview

`FormulaInput` is a sophisticated contentEditable-based input component inspired by SlateJS that allows users to compose text with embedded variable references. It supports two modes: **Normal Mode** for text with variables, and **Formula Mode** for mathematical expressions with numerical variables only.

## Features

### Core Functionality
- ✅ **Variable Insertion**: Type `@` to trigger autocomplete dropdown for variables
- ✅ **Dual Mode Support**: Normal text mode and Formula mode (starts with `=`)
- ✅ **Variable Highlighting**: Variables appear as styled pills with hidden `@` symbol
- ✅ **Tooltips**: Hover over variables to see their descriptions
- ✅ **Smart Deletion**: Backspace/Delete removes entire variable elements
- ✅ **Keyboard Navigation**: Arrow keys, Enter, and Escape for dropdown navigation
- ✅ **Formula Mode Restrictions**: Only numerical variables allowed in formulas
- ✅ **Theme Support**: Full integration with Mantine color scheme (light/dark)

## Architecture

### Implementation Approach
The component uses a **contentEditable div with DOM manipulation** (inspired by SlateJS) rather than textarea with overlays, providing:
- Native cursor positioning without complex calculations
- Direct DOM element manipulation for variables
- Better performance and user experience
- Clean separation between internal representation and output

### Data Flow
```
Input (String) → HTML with Variable Elements → User Interaction → Output (String)
    ↓                      ↓                          ↓                  ↓
 "@revenue"         <span>revenue</span>         Edit/Delete         "@revenue"
```

### Key Technical Decisions

1. **ContentEditable over Textarea**
   - Better cursor control
   - Native element selection
   - No overlay synchronization issues

2. **String I/O with DOM Internal**
   - Input: String with `@variable` format
   - Internal: HTML with `<span class="variable">` elements
   - Output: Back to string with `@variable` format

3. **Zero-Width Spaces (`\u200B`)**
   - Inserted after each variable element
   - Provides text node for cursor positioning
   - Filtered out in string output

4. **Range Persistence**
   - Saves selection range before dropdown interaction
   - Prevents cursor loss when clicking dropdown
   - Uses `savedRangeRef` for restoration

## Component Interface

### Props
```typescript
interface FormulaInputProps {
  value: string;                    // Current value (e.g., "= @revenue - @cost")
  onChange: (value: string) => void; // Value change handler
  variables: Variable[];             // Available variables
}

interface Variable {
  name: string;           // Variable identifier (without @)
  description?: string;   // Tooltip description
  isNumerical?: boolean;  // true = numerical, false/undefined = text
}
```

### Example Usage
```tsx
<FormulaInput
  value={formulaValue}
  onChange={setFormulaValue}
  variables={[
    { name: "revenue", description: "Total revenue", isNumerical: true },
    { name: "cost", description: "Total cost", isNumerical: true },
    { name: "customerName", description: "Customer name" },
  ]}
/>
```

## Modes

### Normal Mode
- **Trigger**: Default state or when value doesn't start with `=`
- **Behavior**: All variables (numerical and text) are available
- **Use Case**: Template strings, text with dynamic values

### Formula Mode
- **Trigger**: Value starts with `=`
- **Behavior**: Only numerical variables available
- **Auto-clear**: Typing `=` in normal mode clears content (except on initial mount)
- **Protection**: Cannot type `=` while already in formula mode
- **Use Case**: Mathematical calculations

## Key Functions

### `stringToHtml(text: string): string`
Converts string format to HTML with variable elements.
```typescript
// Input:  "Hello @customerName, total: @revenue"
// Output: "Hello <span class="variable">customerName</span>\u200B, total: <span>revenue</span>\u200B"
```

### `htmlToString(element: HTMLDivElement): string`
Converts editor HTML back to string format.
```typescript
// Input:  <div>Hello <span class="variable">customerName</span>!</div>
// Output: "Hello @customerName!"
```

### `insertVariable(variable: Variable)`
Inserts a variable at cursor position:
1. Uses saved range or current selection
2. Finds last `@` before cursor
3. Creates variable span element
4. Adds zero-width space after
5. Updates DOM and repositions cursor

### `checkForVariableTrigger()`
Detects `@` character and shows dropdown:
1. Gets current selection and cursor position
2. Finds last `@` in text before cursor
3. Extracts search term after `@`
4. Filters variables by search term and mode
5. Positions dropdown at cursor location

## State Management

### Component State
```typescript
const [showDropdown, setShowDropdown] = useState(false);      // Dropdown visibility
const [dropdownPosition, setDropdownPosition] = useState({...}); // Dropdown position
const [searchTerm, setSearchTerm] = useState("");            // Current search after @
const [selectedIndex, setSelectedIndex] = useState(0);       // Selected dropdown item
```

### Refs
```typescript
const editorRef = useRef<HTMLDivElement>(null);            // ContentEditable element
const dropdownRef = useRef<HTMLDivElement>(null);          // Dropdown container
const containerRef = useRef<HTMLDivElement>(null);         // Wrapper container
const savedRangeRef = useRef<Range | null>(null);          // Saved selection range
const previousFormulaModeRef = useRef<boolean | null>(null); // Mode tracking
const isComposingRef = useRef(false);                      // IME composition state
```

## Event Handlers

### `handleInput()`
Called on every input change:
1. Converts current HTML to string
2. Calls `onChange` with new value
3. Checks for `@` trigger

### `handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>)`
Handles keyboard events:
- Prevents `=` in formula mode
- Arrow keys for dropdown navigation with auto-scroll
- Enter to select variable
- Escape to close dropdown
- Backspace/Delete for variable removal

### Variable Deletion Logic
**Backspace**:
- Cursor inside/after variable → removes entire variable
- Uses `findVariableAtPosition()` for detection

**Delete**:
- Cursor before/inside variable → removes entire variable

## Styling & Theme

### CSS Variables Used
```typescript
const primaryColor = color("primary");                    // Variable text color
const primaryColorLight = color("primary.1");             // Variable background
const descriptionColor = color("gray");                   // Descriptions
const borderColor = "var(--mantine-color-default-border)"; // Borders
const backgroundColor = colorScheme === "light" ? "..." : "..."; // Background
const hoverBackgroundColor = colorScheme === "light" ? "..." : "..."; // Hover state
```

### Variable Pills
- Blue background with darker blue text (light mode)
- Rounded corners (4px)
- Padding: 4px
- Font size: 0.70rem
- Font weight: 600
- Cursor: help (shows tooltip)

### Tooltip (Custom CSS)
- Positioned above variable
- Black background (90% opacity)
- White text
- Fade-in animation (0.2s)
- Uses `::after` pseudo-element with `attr(title)`

## Known Behaviors

### ✅ Expected Behaviors
1. **Initial Value**: Preserves initial value even if it starts with `=`
2. **Mode Switch**: Only clears when user manually types `=` in normal mode
3. **No Auto-focus**: Component doesn't steal focus automatically
4. **Cursor Positioning**: Zero-width spaces ensure proper cursor placement
5. **Dropdown Positioning**: Appears near cursor, not at bottom of input

### ⚠️ Edge Cases Handled
1. **Clicking Dropdown**: `preventDefault` on mousedown to prevent focus loss
2. **IME Composition**: `isComposingRef` prevents updates during text composition
3. **Empty Variables**: Shows all variables when search term is empty
4. **No Matches**: Shows "No variables found" message
5. **Formula Mode Filter**: Only shows numerical variables in formula mode

## Performance Considerations

### Optimizations
- **useMemo**: Not currently used but could optimize `filteredVariables`
- **Zero-width Spaces**: Minimal overhead, filtered on output
- **Direct DOM Manipulation**: Faster than React re-renders for cursor operations
- **CSS Tooltips**: No JS overhead, pure CSS with `::after`

### Potential Improvements
- Debounce `handleInput` for large variable lists
- Virtual scrolling for dropdown with many variables
- Memoize `stringToHtml` conversion

## Common Integration Patterns

### Form Integration
```tsx
const [formula, setFormula] = useState("");

<form onSubmit={handleSubmit}>
  <FormulaInput
    value={formula}
    onChange={setFormula}
    variables={availableVariables}
  />
  <Button type="submit">Calculate</Button>
</form>
```

### With Validation
```tsx
const validateFormula = (value: string) => {
  if (value.startsWith("=") && value.length < 3) {
    return "Formula is too short";
  }
  return null;
};

<FormulaInput
  value={formula}
  onChange={(val) => {
    setFormula(val);
    setError(validateFormula(val));
  }}
  variables={variables}
/>
{error && <Text color="red">{error}</Text>}
```

### Dynamic Variables
```tsx
const [variables, setVariables] = useState<Variable[]>([]);

useEffect(() => {
  // Fetch from API
  fetchVariables().then(setVariables);
}, []);

<FormulaInput
  value={value}
  onChange={setValue}
  variables={variables}
/>
```

## Debugging Tips

### Common Issues

**Issue: Cursor position incorrect**
- Check zero-width spaces are being inserted
- Verify `line-height` matches between editor and variables
- Inspect `vertical-align` CSS property

**Issue: Variables not rendering**
- Verify variables array has correct format
- Check variable names match (case-sensitive)
- Inspect HTML output with DevTools

**Issue: Dropdown not showing**
- Check `@` character is being typed
- Verify `filteredVariables` has items
- Inspect `showDropdown` state
- Check z-index conflicts

**Issue: Initial value cleared**
- Verify `previousFormulaModeRef` starts as `null`
- Check useEffect dependencies

### Debug Mode
Add this temporarily to see internal state:
```tsx
{process.env.NODE_ENV === 'development' && (
  <div style={{ fontSize: '10px', color: 'gray' }}>
    <div>Mode: {isFormulaMode ? 'Formula' : 'Normal'}</div>
    <div>Dropdown: {showDropdown ? 'Open' : 'Closed'}</div>
    <div>Search: "{searchTerm}"</div>
    <div>Filtered: {filteredVariables.length}</div>
  </div>
)}
```

## Future Enhancements

### Potential Features
- [ ] **Syntax Highlighting**: Color-code operators in formula mode
- [ ] **Formula Validation**: Real-time syntax checking
- [ ] **Multi-select**: Insert multiple variables at once
- [ ] **Variable Preview**: Show current variable values in tooltip
- [ ] **Keyboard Shortcuts**: Cmd+K for variable picker
- [ ] **Undo/Redo**: History management
- [ ] **Copy/Paste**: Handle formatted text paste
- [ ] **Export Options**: Export as formatted text, HTML, or Markdown
- [ ] **Custom Operators**: Support for custom functions (e.g., `SUM()`, `AVG()`)
- [ ] **Variable Categories**: Group variables by category in dropdown

### API Improvements
```typescript
// Possible future props
interface FormulaInputPropsV2 extends FormulaInputProps {
  onValidate?: (value: string) => ValidationError | null;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  allowedOperators?: string[];
  onVariableClick?: (variable: Variable) => void;
  customVariableRenderer?: (variable: Variable) => ReactNode;
}
```

## Testing Considerations

### Unit Tests
- String to HTML conversion
- HTML to string conversion
- Variable insertion logic
- Dropdown filtering
- Mode switching behavior

### Integration Tests
- Full user flow: type @ → select variable → see output
- Keyboard navigation through dropdown
- Variable deletion with backspace/delete
- Mode switching and content clearing

### E2E Tests
- Form submission with formula
- Multi-variable formula
- Copy/paste behavior
- Focus management

## Migration Guide

### From Textarea-based Input
If migrating from a simple textarea:
```tsx
// Before
<textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// After
<FormulaInput
  value={value}
  onChange={setValue}
  variables={variables}
/>
```

### From Other Rich Text Editors
The component maintains string-based I/O, so it's a drop-in replacement for simple use cases.

## Support & Contributing

### File Structure
```
/components/inputs/formual-input/
  ├── formula-input.tsx    # Main component
  └── README.md           # This file
```

### Key Dependencies
- React 18+
- Mantine UI (for theming)
- TypeScript 5+

### Related Components
- Could be used with: Text inputs, Forms, Expression builders
- Inspiration: SlateJS, ProseMirror, Monaco Editor

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-24  
**Author**: AI Assistant (Claude)  
**Status**: Production Ready ✅

