# MAKE UI Tutorial (Beginner to Builder)

## Who this is for
This tutorial is for you if you can write basic React Native components but want to build a full visual editor app (drag, resize, nesting, export TSX).

## What you will build
By the end, you will have:
- A canvas where users add and select `View`, `Text`, `Button`, `Image`.
- Drag and resize interactions.
- Parent-child nesting into `View`.
- A property editor that updates styles/content in real time.
- A component tree panel for selection/duplicate/delete.
- A TSX export feature.
- (Optional v1.1) AI layout enhancement via a secure proxy server.

---

## Part 0: Prerequisites (What to learn first)

Learn these in order:
1. React Native fundamentals: `View`, `Text`, `Image`, `TouchableOpacity`, `StyleSheet`.
2. Flexbox + absolute positioning in React Native.
3. TypeScript basics: interfaces, unions, optional fields.
4. Zustand basics: global store, actions, selectors.
5. Gesture basics: pan gesture concepts.

If any of these feel weak, spend 1-2 days strengthening them first.

---

## Part 1: Project mental model

You only need to understand 3 core ideas:
1. **State is the source of truth**: the entire canvas is `ComponentNode[]`.
2. **UI is just a renderer**: canvas displays whatever is in state.
3.  d**Interactions mutate state**:rag/resize/edit actions update the store.

If you keep these 3 clear, the project becomes manageable.

---

## Part 2: Build order (exact implementation path)

Do not build everything at once. Follow this order.

### Step 1: Create domain types and defaults
Create:
- `src/features/editor/domain/types.ts`
- `src/features/editor/domain/defaults.ts`

Goal:
- Define `ComponentType`, `ComponentNode`, `CanvasState`.
- Create default node factories for each component.

Checkpoint:
- You can generate one node object of each type.

### Step 2: Create Zustand editor store
Create:
- `src/features/editor/store/editorStore.ts`

Start with actions:
- `addNode(type)`
- `selectNode(id)`
- `updateNode(id, partial)`
- `deleteNode(id)`

Checkpoint:
- You can add components and select one.

### Step 3: Render the canvas recursively
Create:
- `src/features/editor/components/Index/CanvasViewport.tsx`
- `src/features/editor/components/Index/CanvasNode.tsx`

Goal:
- Render root nodes and children recursively.
- Show selected border if node id equals `selectedId`.

Checkpoint:
- You can see added components on screen.

### Step 4: Add sidebar for component creation
Create:
- `src/features/editor/components/Sidebar/ComponentSidebar.tsx`

Goal:
- Buttons for `View`, `Text`, `Button`, `Image`.
- Each tap calls `addNode(type)` with default centered position.

Checkpoint:
- You can create all 4 component types from UI.

### Step 5: Build property editor bottom sheet
Create:
- `src/features/editor/components/PropertyEditor/PropertyEditorSheet.tsx`

Goal:
- Show fields based on selected component type.
- Update width/height/colors/text/etc in real time.

Checkpoint:
- Editing fields visually updates selected node.

### Step 6: Add drag movement
Create:
- `src/features/editor/hooks/useCanvasGestures.ts`
- `src/features/editor/store/actions/moveNode.ts`

Goal:
- Drag selected node and commit final position.
- Keep movement smooth.

Checkpoint:
- Dragging feels stable and updates x/y correctly.

### Step 7: Add resize handles
Create:
- `src/features/editor/components/Index/ResizeHandles.tsx`
- `src/features/editor/store/actions/resizeNode.ts`

Goal:
- Corner handles resize width/height.
- Add min width/height constraints.

Checkpoint:
- Resize works without negative sizes.

### Step 8: Add nesting logic
Create:
- `src/features/editor/services/hitTest.ts`
- `src/features/editor/store/actions/reparentNode.ts`

Goal:
- On drop, detect if inside a `View`.
- If yes, move node under that `View` as child.
- Convert coordinates to parent-relative.

Checkpoint:
- Child follows parent movement after nesting.

### Step 9: Add component tree panel
Create:
- `src/features/editor/components/Tree/ComponentTreePanel.tsx`

Goal:
- Show hierarchy with indentation.
- Select, duplicate, and delete from tree.

Checkpoint:
- Tree and canvas stay in sync.

### Step 10: TSX export
Create:
- `src/features/export/generateTsx.ts`
- `src/features/export/generateStyles.ts`

Goal:
- Traverse tree recursively.
- Generate JSX + `StyleSheet.create`.
- Correctly output Button as `TouchableOpacity` + inner label `Text`.

Checkpoint:
- Exported TSX runs in a clean React Native project.

### Step 11: Undo/redo and hardening
Goal:
- Store snapshots.
- Add input validation and guardrails.

Checkpoint:
- Undo/redo works for create/move/resize/delete/edit.

### Step 12 (Optional): AI enhance v1.1
Create:
- Client request service.
- Node proxy endpoint.
- Safe schema validation for request/response.

Checkpoint:
- You can preview and apply/reject AI suggestions.

---

## Part 3: Weekly learning plan (practical)

### Week 1: Foundations
1. Implement types/defaults/store.
2. Implement canvas renderer + selection.
3. Implement sidebar add flow.

### Week 2: Interactions
1. Implement drag.
2. Implement resize.
3. Implement nesting rules.

### Week 3: Editing + Tree + Export
1. Property editor.
2. Component tree panel.
3. TSX export generator.

### Week 4: Stabilization
1. Undo/redo.
2. Validation/error handling.
3. Test key flows end-to-end.

---

## Part 4: Common mistakes to avoid

1. Mixing UI local state with source-of-truth store state.
2. Mutating deeply nested arrays directly without safe helpers.
3. Forgetting parent-relative coordinate conversion during nesting.
4. Using drag updates that trigger full-tree rerenders every frame.
5. Generating TSX names non-deterministically.

---

## Part 5: Definition of done (MVP checklist)

- [ ] Add all 4 component types.
- [ ] Select one component at a time.
- [ ] Drag + resize components.
- [ ] Edit style/content in property panel.
- [ ] Nest components into `View`.
- [ ] Show full hierarchy in tree panel.
- [ ] Duplicate + delete nodes.
- [ ] Export valid `.tsx` file.
- [ ] App runs on Android with stable interactions.

---

## Part 6: How to study while building

For each step:
1. Read the target file responsibilities.
2. Build smallest working version first.
3. Test manually on device.
4. Refactor only after behavior works.

Use this simple rule:
- **If a feature breaks, inspect store actions first, then rendering, then gestures.**

---

## Part 7: Suggested first coding session (today)

In one session, finish these:
1. Add `types.ts` and `defaults.ts`.
2. Add `editorStore.ts` with add/select/update/delete.
3. Render root nodes on `app/index.tsx`.

If you finish these, the project will stop feeling overwhelming because the architecture will become visible in code.
