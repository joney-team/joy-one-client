# FormulaInput - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FormulaInput                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Props: value, onChange, variables                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         State & Refs Management                      │  │
│  │  • showDropdown, searchTerm, selectedIndex          │  │
│  │  • editorRef, savedRangeRef, previousFormulaModeRef │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│          ┌───────────────┴───────────────┐                  │
│          ▼                               ▼                  │
│  ┌──────────────┐              ┌──────────────────┐        │
│  │  Conversion  │              │  User Interaction│        │
│  │   Engine     │              │     Handlers     │        │
│  └──────────────┘              └──────────────────┘        │
│          │                               │                  │
│          ▼                               ▼                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ContentEditable Editor                     │  │
│  │  <div contenteditable="true">                        │  │
│  │    Text <span class="variable">var</span>₀ more     │  │
│  │  </div>                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Dropdown (Conditional)                     │  │
│  │  • Filtered variables                                │  │
│  │  • Keyboard navigation                               │  │
│  │  • Position tracking                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. Input Phase (Props → Internal State)

```
User/Parent Component
       │
       │ value: "@revenue - @cost"
       ▼
┌─────────────────┐
│ stringToHtml()  │  Converts string to HTML
└─────────────────┘
       │
       │ HTML: "...<span class='variable'>revenue</span>\u200B..."
       ▼
┌─────────────────┐
│   editorRef     │  ContentEditable DOM element
│   .innerHTML    │
└─────────────────┘
```

### 2. User Interaction Phase

```
User Types
    │
    ├─── Types "@"
    │       │
    │       ▼
    │  ┌──────────────────────┐
    │  │checkForVariableTrigger│
    │  └──────────────────────┘
    │       │
    │       ▼
    │  [showDropdown = true]
    │       │
    │       ▼
    │  ┌──────────────────────┐
    │  │ Dropdown Component   │
    │  │ • Filter variables   │
    │  │ • Show matches       │
    │  └──────────────────────┘
    │       │
    │       │ User selects variable
    │       ▼
    │  ┌──────────────────────┐
    │  │  insertVariable()    │
    │  │  • Create span       │
    │  │  • Add \u200B       │
    │  │  • Position cursor   │
    │  └──────────────────────┘
    │
    ├─── Types "="
    │       │
    │       ▼
    │  ┌──────────────────────┐
    │  │  handleKeyDown()     │
    │  │  • Check mode        │
    │  │  • Prevent if needed │
    │  └──────────────────────┘
    │
    └─── Types Backspace
            │
            ▼
       ┌──────────────────────┐
       │  handleKeyDown()     │
       │  • Find variable     │
       │  • Remove entire span│
       └──────────────────────┘
```

### 3. Output Phase (Internal → Props)

```
DOM Changes (handleInput)
       │
       ▼
┌─────────────────┐
│ htmlToString()  │  Converts HTML back to string
└─────────────────┘
       │
       │ value: "@revenue - @cost" (clean, no \u200B)
       ▼
┌─────────────────┐
│  onChange()     │  Callback to parent
└─────────────────┘
```

## Component Structure

```
FormulaInput
│
├── Hooks & Effects
│   ├── useColor() / useColorScheme()
│   ├── useState (dropdown, search, selection)
│   ├── useRef (editor, dropdown, container, range, mode)
│   └── useEffect
│       ├── Mode switching detection
│       └── Value sync (stringToHtml)
│
├── Helper Functions
│   ├── stringToHtml() - Parse string → HTML
│   ├── htmlToString() - Parse HTML → string
│   ├── escapeHtml() - Security
│   ├── getCursorOffset() - Get cursor position
│   └── setCursorOffset() - Set cursor position
│
├── Event Handlers
│   ├── handleInput() - On content change
│   ├── handleKeyDown() - Keyboard events
│   ├── checkForVariableTrigger() - Detect @
│   ├── insertVariable() - Add variable
│   └── scrollToSelectedItem() - Dropdown scroll
│
└── Render
    ├── Container <div>
    ├── <style> (scoped CSS)
    ├── ContentEditable <div>
    │   └── Dynamic content (variables as spans)
    └── Dropdown (conditional)
        ├── Variable list
        └── Empty state
```

## State Machine Diagram

```
┌─────────────┐
│   INITIAL   │
│  (Empty)    │
└──────┬──────┘
       │
       │ User types text
       ▼
┌─────────────┐         Type "@"         ┌──────────────┐
│   NORMAL    │─────────────────────────>│  DROPDOWN    │
│    MODE     │                           │    OPEN      │
│             │<─────────────────────────│  (Normal)    │
└──────┬──────┘     Select/Cancel        └──────────────┘
       │
       │ Type "="
       ▼
┌─────────────┐
│  AUTO CLEAR │
│   (to "=")  │
└──────┬──────┘
       │
       ▼
┌─────────────┐         Type "@"         ┌──────────────┐
│  FORMULA    │─────────────────────────>│  DROPDOWN    │
│    MODE     │                           │    OPEN      │
│             │<─────────────────────────│  (Formula)   │
│    (=...)   │     Select/Cancel        │ (Numerical)  │
└─────────────┘                           └──────────────┘
       │
       │ Delete all (including "=")
       ▼
┌─────────────┐
│   NORMAL    │
│    MODE     │
└─────────────┘
```

## DOM Structure

### Normal Text with Variables

```html
<div class="formula-editor" contenteditable="true">
  Hello 
  <span class="variable" 
        contenteditable="false" 
        data-variable="name"
        title="Customer name">name</span>​
  , your total is 
  <span class="variable" 
        contenteditable="false" 
        data-variable="total"
        title="Total amount">total</span>​
</div>
```

### Formula Mode

```html
<div class="formula-editor" contenteditable="true">
  = 
  <span class="variable" 
        contenteditable="false" 
        data-variable="revenue"
        title="Total revenue"
        style="background-color: #...; color: #...;">revenue</span>​
   - 
  <span class="variable" 
        contenteditable="false" 
        data-variable="cost"
        title="Total cost"
        style="background-color: #...; color: #...;">cost</span>​
</div>
```

## Cursor Management Strategy

```
Text Node    Variable Span    Zero-Width Space    Text Node
    │              │                  │                │
    │              │                  │                │
"Hello "   [name (non-edit)]      [\u200B]       ", total"
    │              │                  │                │
    ▲              ▲                  ▲                ▲
    │              │                  │                │
Can position   Can't position   Can position   Can position
   here          cursor here       here!          here
```

**Why Zero-Width Space?**
- Variable span has `contenteditable="false"`
- Can't place cursor inside non-editable element
- `\u200B` provides adjacent text node for cursor
- Invisible to user, filtered from output

## Selection Persistence Flow

```
User clicks dropdown item
       │
       ▼
┌──────────────────────┐
│ onMouseDown event    │
│ e.preventDefault()   │  ← Prevents editor blur
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ insertVariable()     │
│ Uses savedRangeRef   │  ← Restored selection
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ DOM manipulation     │
│ Insert <span>        │
└──────────────────────┘
```

## Mode Detection & Switching

```
┌────────────────────────────────────────┐
│  previousFormulaModeRef                │
│                                        │
│  Initial:  null    (skip clear logic) │
│  Mount:    true/false  (track mode)   │
│  Update:   previous value              │
└────────────────────────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  isFormulaMode │  = value.startsWith("=")
            └───────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
    wasFormulaMode        isFormulaMode
       false                 true
          │                   │
          └────────┬──────────┘
                   │
                   ▼
          Mode Switch Detected!
                   │
                   ▼
          ┌────────────────┐
          │  onChange("=") │  Clear to "="
          └────────────────┘
```

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| String → HTML | O(n) | n = string length |
| HTML → String | O(n) | n = DOM nodes |
| Insert Variable | O(1) | Direct DOM manipulation |
| Filter Variables | O(m) | m = variables.length |
| Dropdown Render | O(k) | k = filtered results |
| Delete Variable | O(1) | Direct element removal |

**Bottlenecks:**
- Large variable lists (100+): Consider virtualization
- Complex formulas: Regex parsing can be optimized
- Frequent updates: Could benefit from debouncing

## Memory Management

```
Component Lifecycle
       │
       ├─── Mount
       │     • Create refs
       │     • Setup event listeners
       │
       ├─── Updates
       │     • DOM sync via useEffect
       │     • Range saved/restored
       │
       └─── Unmount
             • Event listeners cleaned up
             • Refs garbage collected
```

## Security Considerations

1. **XSS Prevention**
   - `escapeHtml()` function for user input
   - `textContent` instead of `innerHTML` where possible
   - Variable names are escaped in HTML generation

2. **Input Sanitization**
   - Only allow `@\w+` pattern for variables
   - No arbitrary HTML injection
   - ContentEditable constrained

## Extension Points

```
┌──────────────────────────────────────┐
│         Current Props                │
│  • value: string                     │
│  • onChange: (string) => void        │
│  • variables: Variable[]             │
└──────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────┐
│      Potential Extensions            │
│  • onValidate?: ValidationFn         │
│  • renderVariable?: RenderFn         │
│  • operators?: string[]              │
│  • maxVariables?: number             │
│  • readOnly?: boolean                │
└──────────────────────────────────────┘
```

## Integration Architecture

```
Application Layer
       │
       ├─── Form Component
       │       │
       │       └─── FormulaInput
       │               │
       │               ├─── Variable Source (API/Props)
       │               │
       │               └─── Output Handler
       │                      │
       │                      ├─── Validation
       │                      ├─── Storage
       │                      └─── Calculation
       │
       └─── Theme Provider (Mantine)
               │
               └─── Colors, ColorScheme
```

---

**Architecture Version**: 1.0  
**Last Updated**: 2025-10-24  
**Complexity Level**: Medium-High  
**Recommended Team Size**: 1-2 developers for maintenance

