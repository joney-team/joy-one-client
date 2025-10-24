# FormulaInput - Quick Reference for AI Agents

## TL;DR
A rich text input that converts `@variable` strings into styled pills. Supports formulas starting with `=`.

## Essential Facts

### Input/Output
- **Input**: String like `"= @revenue - @cost"` or `"Hello @name"`
- **Internal**: HTML with `<span class="variable">` elements
- **Output**: Back to string format with `@variable`

### Two Modes
1. **Normal**: All variables allowed (text + numerical)
2. **Formula**: Only numerical variables (triggered by starting with `=`)

### Core Mechanism
- Uses **contentEditable div** (not textarea)
- Variables are **non-editable spans** (`contenteditable="false"`)
- **Zero-width spaces** (`\u200B`) after variables for cursor positioning
- **Saved range** (`savedRangeRef`) prevents cursor loss on dropdown clicks

## Quick Implementation Checklist

```tsx
// ✅ Minimal setup
<FormulaInput
  value={value}              // String: "@var1 @var2"
  onChange={setValue}        // (val: string) => void
  variables={[              // Variable[]
    { name: "var1", description: "Desc", isNumerical: true }
  ]}
/>
```

## Key Files & Functions

### Main Functions
| Function | Purpose |
|----------|---------|
| `stringToHtml()` | String → HTML with variable elements |
| `htmlToString()` | HTML → String with @variables |
| `insertVariable()` | Add variable at cursor |
| `checkForVariableTrigger()` | Detect @ and show dropdown |
| `handleKeyDown()` | Keyboard: arrows, enter, backspace/delete |

### State to Check
```typescript
showDropdown: boolean          // Is dropdown visible?
searchTerm: string            // Text after @ for filtering
isFormulaMode: boolean        // Does value start with =?
filteredVariables: Variable[] // Variables after filtering
```

## Common Tasks

### Add New Variable
```typescript
setVariables([...variables, {
  name: "newVar",
  description: "New variable",
  isNumerical: true
}]);
```

### Parse Output
```typescript
// Output: "= @revenue - @cost"
const variables = value.match(/@(\w+)/g); // ["@revenue", "@cost"]
const names = value.match(/@(\w+)/g)?.map(v => v.slice(1)); // ["revenue", "cost"]
```

### Validate Formula
```typescript
const isValid = (val: string) => {
  if (!val.startsWith("=")) return true;
  return val.length > 2; // Has content after =
};
```

## Styling Quick Ref

```css
.formula-editor              /* The contentEditable div */
.formula-editor .variable    /* Variable pills */
.formula-editor .variable::after /* Tooltip */
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Initial value cleared | Check `previousFormulaModeRef` is `null` initially |
| Cursor jumps | Check zero-width spaces are inserted |
| Dropdown wrong position | Check `containerRef` and `getBoundingClientRect()` |
| Variables not highlighted | Verify `variables` array format |
| Can't delete variable | Check `findVariableAtPosition()` logic |

## Important Refs

```typescript
editorRef              // The contentEditable element
savedRangeRef          // Selection before dropdown click
previousFormulaModeRef // Track mode changes (null → prevents initial clear)
isComposingRef         // IME composition state
```

## Mode Switching Logic

```typescript
// On mount: previousFormulaModeRef = null → Skip clearing
// User types =: previousFormulaModeRef = false → Clear to "="
// Already in formula: Prevent typing = (keyDown handler)
```

## Critical Behaviors

1. **No auto-focus** - Component doesn't steal focus
2. **No auto-space** - No space added after variables
3. **Entire variable deletion** - Backspace/Delete removes whole variable
4. **Initial value preserved** - Won't clear initial formulas
5. **Dropdown prevents focus loss** - `preventDefault` on mouseDown

## Integration Patterns

### With Form
```tsx
const handleSubmit = (e) => {
  // formula is already a string
  const vars = extractVariables(formula);
  calculate(formula, vars);
};
```

### With Validation
```tsx
const error = formula.startsWith("=") && formula.length < 3
  ? "Formula too short" : null;
```

## Next Steps for Development

1. **Extend Variables**: Add more fields to `Variable` interface
2. **Add Validation**: Implement `onValidate` prop
3. **Syntax Highlighting**: Color operators differently
4. **Custom Rendering**: Add `renderVariable` prop
5. **History**: Implement undo/redo

## Key Dependencies
- React 18+
- Mantine (theming: `useColor`, `useColorScheme`)
- TypeScript

## Files
- `formula-input.tsx` - Main component (720 lines)
- `README.md` - Full documentation
- `QUICK_REFERENCE.md` - This file

---
**Quick Start Time**: ~5 minutes  
**Complexity**: Medium  
**Maintenance**: Low  

