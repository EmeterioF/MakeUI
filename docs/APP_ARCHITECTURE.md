# MAKE UI App Architecture

## 1) Architecture Goals
- Android-first visual editor for React Native UI layouts.
- Single source of truth for layout state in Zustand.
- Smooth drag/resize/select interactions (60fps target).
- Deterministic TSX code generation from canvas tree.
- Clear separation between editor runtime and export/runtime code.

## 2) High-Level System Design
- Client: Expo + React Native app (Android target).
- State: Zustand store with immutable tree updates.
- Interaction engine: gesture + hit-testing + nesting resolver.
- Render engine: recursive canvas renderer from `ComponentNode[]`.
- Export engine: tree-to-TSX + StyleSheet generator.
- AI enhancer (v1.1): app -> Node proxy -> OpenAI API -> suggested layout diff.

## 3) Proposed Folder Structure
```text
app/
  _layout.tsx
  index.tsx                      # Editor screen entry
  export-preview.tsx             # Optional preview before copy/share

src/
  features/
    editor/
      components/
        Index/
          CanvasViewport.tsx
          CanvasNode.tsx
          SelectionOverlay.tsx
          ResizeHandles.tsx
        Sidebar/
          ComponentSidebar.tsx
        Tree/
          ComponentTreePanel.tsx
          TreeNodeRow.tsx
        PropertyEditor/
          PropertyEditorSheet.tsx
          fields/
            NumberField.tsx
            ColorField.tsx
            TextField.tsx
            SelectField.tsx
      store/
        editorStore.ts
        selectors.ts
        actions/
          addNode.ts
          updateNodeStyle.ts
          moveNode.ts
          resizeNode.ts
          selectNode.ts
          duplicateNode.ts
          deleteNode.ts
          reparentNode.ts
      domain/
        types.ts
        defaults.ts
        validation.ts
      services/
        hitTest.ts
        layoutMath.ts
        treeOps.ts
        serializeCanvas.ts
      hooks/
        useCanvasGestures.ts
        useSelection.ts
        useNesting.ts
      constants/
        canvas.ts
        editor.ts

    export/
      generateTsx.ts
      generateStyles.ts
      formatOutput.ts
      naming.ts

    ai-enhance/
      enhanceClient.ts
      mappers.ts
      diff.ts
      applySuggestion.ts

  shared/
    ui/
    utils/
      id.ts
      deepClone.ts
      color.ts
    types/

server/                           # v1.1 proxy
  src/
    index.ts
    routes/
      enhance.ts
    services/
      openaiEnhance.ts
    schemas/
      enhance.schema.ts
```

## 4) Domain Model (Core)
- Keep `ComponentNode` exactly as defined in your spec.
- Root state:
  - `components: ComponentNode[]`
  - `selectedId: string | null`
- Add internal editor metadata in store (not in export model):
  - `history` for undo/redo snapshots.
  - `viewport` (zoom/offset if added later).
  - `ui` flags (open panels, loading states).

## 5) Store Design (Zustand)
- `editorStore` owns all mutations.
- Action groups:
  - CRUD: add, delete, duplicate.
  - Selection: select/clear select.
  - Geometry: move/resize.
  - Tree: reparent (for nesting).
  - Style/content: update style keys, update content.
  - Utilities: import JSON, reset canvas, undo/redo.
- Rule: all writes go through `treeOps` helpers to prevent inconsistent trees.

## 6) Rendering Pipeline
1. `CanvasViewport` renders bounded editor area.
2. For each root node, render `CanvasNode` recursively.
3. `CanvasNode` maps type:
   - `View` -> `View`
   - `Text` -> `Text`
   - `Button` -> `TouchableOpacity` + label `Text`
   - `Image` -> `Image`
4. Absolute layout style applied from `x/y/width/height`.
5. Selection state draws overlay/handles for selected node only.

## 7) Interaction Engine
- Use `react-native-gesture-handler` + `reanimated` for drag/resize.
- Gesture flow:
  - On start: lock currently selected node.
  - On active: update transient position/size.
  - On end: commit to Zustand action.
- Nesting flow:
  - On drop, run `hitTest` against eligible `View` nodes.
  - Choose deepest valid target under pointer.
  - Convert coordinates from old parent space to new parent space.
  - Call `reparentNode`.
- Constraints:
  - Prevent self-nesting/cycle.
  - Clamp width/height min values.
  - Optional snap-to-grid in `layoutMath`.

## 8) Component Tree Panel
- Displays recursive hierarchy from `components`.
- Node actions:
  - Select node.
  - Duplicate subtree.
  - Delete subtree.
- Tree is canonical for parent-child correctness debugging.

## 9) Property Editor
- Bottom sheet visible only when `selectedId` exists.
- Dynamic field schema by type:
  - Common: width/height/x/y/background/border.
  - Text: content/fontSize/fontWeight/color/textAlign.
  - Button: label/bg/radius/text color/font/textAlign.
  - Image: URL/radius/resizeMode.
- Update strategy:
  - Debounced commits for text/URL.
  - Immediate commits for numeric sliders/steppers.

## 10) Export Architecture
- `generateTsx(components)`:
  - DFS traversal, deterministic order.
  - Create stable style keys (`comp_<id>` sanitized).
  - Emit imports based on used types.
  - Build JSX + `StyleSheet.create`.
- Button export:
  - Outer `TouchableOpacity` style + inner label style.
- Output validation:
  - Ensure no unsupported keys.
  - Fallback defaults for missing required fields.

## 11) AI Enhance (v1.1) Architecture
- Client:
  - Serialize current canvas -> compact JSON.
  - POST `/enhance-layout`.
  - Receive suggested full tree (or patch) + rationale.
  - Show side-by-side preview and Apply/Reject.
- Proxy (Node):
  - Validate schema.
  - Inject system rules (only allowed component/style fields).
  - Call OpenAI API server-side.
  - Validate response schema and return safe payload.
- Safety:
  - Never expose API key in mobile app.
  - Reject unsupported component types/properties.

## 12) Error Handling & Validation
- Central validators:
  - Node shape validation.
  - Style key whitelist per component type.
  - Content constraints (`Image` URL format, numeric bounds).
- Recoverable failures:
  - Invalid edit -> ignore + show toast.
  - Export failure -> show error modal with diagnostics.

## 13) Performance Strategy
- Normalize expensive lookups with memoized selectors.
- Keep gesture updates mostly on UI thread; commit final state on end.
- `React.memo` for node rows and non-selected canvas nodes.
- Avoid full-tree rerender by selecting minimal state slices.

## 14) Testing Strategy
- Unit:
  - `treeOps` (add/delete/reparent/duplicate).
  - `layoutMath` coordinate transforms.
  - `generateTsx` snapshots.
- Integration:
  - drag/drop nesting behavior.
  - property editor updates reflected on canvas.
- E2E (Detox, later):
  - Create layout -> export -> verify generated code content.

## 15) Delivery Phases
1. Foundation: types, store, canvas render, selection.
2. Interactions: drag, resize, nesting, tree panel.
3. Editing: property editor + validation.
4. Export: TSX generator + preview/copy flow.
5. Hardening: undo/redo, tests, performance pass.
6. v1.1: AI enhance proxy + preview/apply/reject.

## 16) Non-Goals (Enforced)
- No iOS or web-first behavior assumptions.
- No custom component marketplace.
- No behavior/event-prop authoring (`onPress`, etc.).
- No TSX import/parser.
