# Circuit Crafter - Desktop UX Quick Start Guide

**Start here for immediate UI/UX improvements**

---

## TL;DR - Top 5 Quick Wins (2-3 Hours Each)

### 1. Component Hover Tooltips (HIGH IMPACT)
**What:** Show component specs on hover in palette
**Why:** Users need to know what components do before placing them
**Effort:** 2-3 hours

**Implementation:**
- Add hover state to `ComponentPalette.tsx`
- Create `ComponentHoverPreview.tsx` component
- Show voltage, resistance, or other specs
- Display with smooth fade-in animation

### 2. Keyboard Shortcut Hints (HIGH IMPACT)
**What:** Show contextual keyboard shortcuts overlay
**Why:** Power users don't know shortcuts exist
**Effort:** 2 hours

**Implementation:**
- Create `KeyboardShortcutHints.tsx` component
- Show in bottom-right corner
- Update based on selection state
- Add number keys (1-9) for quick component placement

### 3. Terminal Hover Glow (MEDIUM IMPACT)
**What:** Glowing effect on terminal hover
**Why:** Visual feedback makes wiring more intuitive
**Effort:** 1 hour

**Implementation:**
- Add hover animations to CSS
- Increase terminal size on hover
- Add glow shadow effect
- Color-code by terminal type

### 4. Copy/Paste (VERY HIGH IMPACT)
**What:** Ctrl+C / Ctrl+V for components
**Why:** Massive productivity boost
**Effort:** 3-4 hours

**Implementation:**
- Add clipboard state to `circuitStore.ts`
- Handle Ctrl+C: Copy selected components with wires
- Handle Ctrl+V: Paste at cursor or center
- Generate new IDs for pasted components

### 5. Circuit Complexity Meter (HIGH IMPACT)
**What:** Real-time score based on circuit complexity
**Why:** Gamification + feedback on circuit quality
**Effort:** 2 hours

**Implementation:**
- Create `useCircuitComplexity.ts` hook
- Calculate score from components, wires, efficiency
- Display with grade (A-F) and progress bar
- Add to Toolbar

---

## Implementation Checklist

### Week 1: Foundation (8-10 hours)

- [ ] **Component Hover Tooltips**
  - [ ] Add hover state tracking
  - [ ] Create preview component with specs
  - [ ] Position next to hovered item
  - [ ] Add fade-in animation
  - [ ] Test with all component types

- [ ] **Keyboard Shortcut Hints**
  - [ ] Create overlay component
  - [ ] Add contextual hint logic
  - [ ] Implement number key placement
  - [ ] Add toggle with '/' key
  - [ ] Update keyboard shortcuts panel

- [ ] **Terminal Hover Effects**
  - [ ] Add CSS animations
  - [ ] Increase terminal size on hover
  - [ ] Add glow effect
  - [ ] Test with wire drawing

### Week 2: Productivity (12-15 hours)

- [ ] **Copy/Paste**
  - [ ] Add clipboard state to store
  - [ ] Implement Ctrl+C handler
  - [ ] Implement Ctrl+V handler
  - [ ] Handle wire preservation
  - [ ] Add visual feedback (toast)
  - [ ] Test with complex circuits

- [ ] **Undo/Redo UI**
  - [ ] Add buttons to toolbar
  - [ ] Hook up to existing store methods
  - [ ] Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - [ ] Show toast on undo/redo
  - [ ] Disable when history unavailable

- [ ] **Circuit Complexity Meter**
  - [ ] Create calculation hook
  - [ ] Build meter component
  - [ ] Add to toolbar
  - [ ] Animate score changes
  - [ ] Color-code by grade

### Week 3: Polish (10-12 hours)

- [ ] **Auto-Save Indicator**
  - [ ] Create auto-save hook
  - [ ] Add indicator component
  - [ ] Show save status
  - [ ] Display last saved time
  - [ ] Handle errors gracefully

- [ ] **Search/Filter Components**
  - [ ] Add search input to palette
  - [ ] Implement fuzzy search
  - [ ] Add keyboard shortcut (Ctrl+K)
  - [ ] Show recent/favorites
  - [ ] Filter by category

- [ ] **Loading Skeletons**
  - [ ] Create skeleton components
  - [ ] Add to simulation panel
  - [ ] Add to component palette
  - [ ] Shimmer animation

---

## Code Snippets

### Quick Component Hover Tooltip

```typescript
// In ComponentPalette.tsx
const [hoveredComponent, setHoveredComponent] = useState<ComponentInfo | null>(null);

// In ComponentItem:
<div
  onMouseEnter={() => setHoveredComponent(component)}
  onMouseLeave={() => setHoveredComponent(null)}
  className="relative"
>
  {/* Component content */}

  {/* Tooltip */}
  {hoveredComponent === component && (
    <div className="absolute z-50 bg-gray-800 border border-blue-500 rounded-lg p-3 shadow-xl left-full ml-2 top-0 w-64 animate-fade-in">
      <h4 className="font-bold mb-2">{component.name}</h4>
      <p className="text-xs text-gray-400 mb-2">{component.description}</p>
      <div className="text-xs space-y-1">
        {/* Add component-specific specs */}
        {component.type === 'battery' && (
          <div>Voltage: {component.variant?.voltage || 9}V</div>
        )}
        {component.type === 'resistor' && (
          <div>Resistance: Variable</div>
        )}
      </div>
    </div>
  )}
</div>
```

### Quick Keyboard Shortcut Handler

```typescript
// In CircuitCanvas.tsx, add to existing keyboard handler:

// Number keys for quick component placement
const componentMap: Record<string, ComponentType> = {
  '1': 'battery',
  '2': 'resistor',
  '3': 'led',
  '4': 'switch',
  '5': 'ground',
};

if (componentMap[e.key]) {
  const center = {
    x: (dimensions.width / 2 - canvasOffset.x) / canvasScale,
    y: (dimensions.height / 2 - canvasOffset.y) / canvasScale,
  };

  useCircuitStore.getState().addComponent(
    componentMap[e.key],
    center
  );
}
```

### Quick Copy/Paste

```typescript
// Add to circuitStore.ts:
interface CircuitState {
  // ... existing state ...
  clipboard: {
    components: CircuitComponent[];
    wires: Wire[];
  } | null;
}

// Add actions:
copySelection: () => {
  const { selectedComponentId, components, wires } = get();
  if (!selectedComponentId) return;

  const component = components.find(c => c.id === selectedComponentId);
  if (!component) return;

  // Find connected wires
  const terminalIds = component.terminals.map(t => t.id);
  const connectedWires = wires.filter(w =>
    terminalIds.includes(w.fromTerminal) || terminalIds.includes(w.toTerminal)
  );

  set({
    clipboard: {
      components: [component],
      wires: connectedWires,
    },
  });
},

pasteFromClipboard: (position: Position) => {
  const { clipboard } = get();
  if (!clipboard) return;

  // Clone components with new IDs
  const idMap = new Map<string, string>();
  const newComponents = clipboard.components.map(c => {
    const newId = generateId();
    idMap.set(c.id, newId);

    return {
      ...c,
      id: newId,
      position: {
        x: position.x,
        y: position.y,
      },
      terminals: c.terminals.map(t => ({
        ...t,
        id: generateId(),
      })),
    };
  });

  // Clone wires with new terminal IDs
  // ... (wire cloning logic)

  set(state => ({
    components: [...state.components, ...newComponents],
    wires: [...state.wires, ...newWires],
  }));
},
```

### Quick Complexity Meter

```typescript
// Create hooks/useCircuitComplexity.ts:
export function useCircuitComplexity() {
  const { components, wires, simulationResult } = useCircuitStore();

  return useMemo(() => {
    const score = Math.min(100,
      (components.length * 5) +
      (wires.length * 3) +
      (simulationResult ? 20 : 0)
    );

    const grade =
      score >= 90 ? 'A' :
      score >= 80 ? 'B' :
      score >= 70 ? 'C' :
      score >= 60 ? 'D' : 'F';

    return { score, grade, components: components.length, wires: wires.length };
  }, [components, wires, simulationResult]);
}

// Create ComplexityMeter.tsx:
export function ComplexityMeter() {
  const { score, grade } = useCircuitComplexity();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
      <span className={`text-xl font-bold ${
        grade === 'A' ? 'text-green-500' :
        grade === 'B' ? 'text-blue-500' :
        grade === 'C' ? 'text-yellow-500' :
        'text-red-500'
      }`}>
        {grade}
      </span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{score}</span>
    </div>
  );
}

// Add to Toolbar.tsx:
import { ComplexityMeter } from './ComplexityMeter';

// In Toolbar component:
<ComplexityMeter />
```

---

## Testing Checklist

### Manual Testing
- [ ] Hover tooltips work on all components
- [ ] Keyboard shortcuts respond correctly
- [ ] Terminal hover effects are smooth
- [ ] Copy/paste preserves circuit structure
- [ ] Complexity meter updates in real-time
- [ ] Auto-save indicator shows correct status

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance Testing
- [ ] Canvas maintains 60fps with tooltips
- [ ] Keyboard shortcuts respond < 50ms
- [ ] Copy/paste handles large circuits
- [ ] Complexity calculation < 10ms

---

## Common Pitfalls

### 1. Tooltip Positioning
**Problem:** Tooltip goes off-screen
**Solution:** Add boundary detection and flip position

```typescript
const getTooltipPosition = (rect: DOMRect) => {
  const spaceRight = window.innerWidth - rect.right;
  const spaceLeft = rect.left;

  return {
    x: spaceRight > 300 ? rect.right + 10 : rect.left - 310,
    y: rect.top,
  };
};
```

### 2. Keyboard Conflicts
**Problem:** Shortcuts conflict with browser
**Solution:** Prevent default and check modifiers

```typescript
if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
  e.preventDefault();
  copySelection();
}
```

### 3. Performance with Hover States
**Problem:** Too many re-renders on mouse move
**Solution:** Debounce hover state updates

```typescript
const debouncedSetHover = useMemo(
  () => debounce(setHoveredComponent, 50),
  []
);
```

### 4. Copy/Paste ID Conflicts
**Problem:** Pasted components have duplicate IDs
**Solution:** Generate new IDs for all entities

```typescript
const newId = generateId();
const newTerminalIds = component.terminals.map(() => generateId());
```

---

## Resources

### Existing Files to Modify
- `apps/web/src/components/ComponentPalette.tsx` - Add hover tooltips
- `apps/web/src/canvas/CircuitCanvas.tsx` - Add keyboard handlers
- `apps/web/src/components/Toolbar.tsx` - Add complexity meter
- `apps/web/src/stores/circuitStore.ts` - Add clipboard state
- `apps/web/src/styles/index.css` - Add hover animations

### New Files to Create
- `apps/web/src/components/ComponentHoverPreview.tsx`
- `apps/web/src/components/KeyboardShortcutHints.tsx`
- `apps/web/src/components/ComplexityMeter.tsx`
- `apps/web/src/hooks/useCircuitComplexity.ts`
- `apps/web/src/hooks/useAutoSave.ts`

### Design System Reference
- **Colors:**
  - Primary: `#3b82f6` (blue-500)
  - Success: `#22c55e` (green-500)
  - Warning: `#eab308` (yellow-500)
  - Error: `#ef4444` (red-500)
  - Gray: `#6b7280` (gray-500)

- **Spacing:**
  - Gap: `0.5rem` (2), `0.75rem` (3), `1rem` (4)
  - Padding: `0.75rem` (3), `1rem` (4), `1.5rem` (6)

- **Border Radius:**
  - Small: `0.375rem` (rounded-md)
  - Medium: `0.5rem` (rounded-lg)
  - Large: `0.75rem` (rounded-xl)

---

## Success Criteria

### User Experience
- [ ] Users discover hover tooltips naturally
- [ ] Keyboard shortcuts are used by 30%+ of users
- [ ] Copy/paste saves users time (measured)
- [ ] Complexity meter is understood and valued

### Performance
- [ ] No FPS drop with hover states
- [ ] Keyboard shortcuts respond instantly
- [ ] Copy/paste handles 50+ component circuits

### Adoption
- [ ] 60%+ hover over components before placing
- [ ] 40%+ use at least one keyboard shortcut
- [ ] 20%+ use copy/paste feature
- [ ] Complexity meter viewed by 80%+ of users

---

## Next Steps After Quick Wins

1. **Week 4-5:** Minimap, Multi-select, Templates
2. **Week 6:** Panel resize, Smooth animations
3. **Week 7:** Achievement widgets, Engagement features
4. **Week 8:** Polish, A/B testing, Refinement

---

## Questions?

- **Hover tooltips flickering?** Increase debounce delay
- **Keyboard shortcuts not working?** Check for event.preventDefault()
- **Copy/paste creates invalid circuits?** Validate terminal connections
- **Complexity score too low?** Adjust scoring formula

**Pro Tip:** Start with terminal hover glow - it's the easiest and most visually impressive quick win!
