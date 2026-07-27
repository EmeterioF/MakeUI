# Project → Screens Hierarchy Implementation Plan

## Goal
Add a **Project** layer above the current flat "component files" so users can:
- Create projects (folders) on the home screen
- Add multiple screens inside a project
- Export the entire project as a zip folder of `.tsx` files

---

## 1. Database — add projects table

**File:** `data/componentFileRepository.ts`

### New table
```sql
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Add to existing `component_files`
- `project_id INTEGER` — FK to `projects.id`
- `sort_order INTEGER DEFAULT 0` — screen ordering within a project

```sql
ALTER TABLE component_files ADD COLUMN project_id INTEGER REFERENCES projects(id);
ALTER TABLE component_files ADD COLUMN sort_order INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_component_files_project ON component_files(project_id);
```

### New types
```ts
type ProjectListItem = { id: number; name: string; screenCount: number; updated_at: string }
type ProjectRecord = { id: number; name: string; created_at: string; updated_at: string }
```

### New CRUD functions
| Function | Description |
|----------|-------------|
| `createProject(name)` | Insert + return id |
| `listProjects()` | Return all projects with screen count |
| `getProjectById(id)` | Single project record |
| `updateProject(id, name)` | Rename |
| `deleteProject(id)` | Delete project + cascade screens |
| `listScreensByProjectId(id)` | Return screens for a project |

### Updated existing functions
- `createComponentFile` → accept `projectId` param
- `updateComponentFile` → accept `projectId` param
- `listComponentFiles` → filter by `projectId` when provided
- `deleteComponentFile` → no change needed

---

## 2. New project store

**File:** `editor/projectStore.ts` (new)

```ts
import { create } from 'zustand';

interface ProjectStore {
  projects: ProjectListItem[];
  selectedProjectId: number | null;
  selectedProject: ProjectListItem | null;
  isLoading: boolean;

  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<number>;
  renameProject: (id: number, name: string) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  selectProject: (id: number | null) => void;
}
```

---

## 3. Home screen — project-first navigation

### Flow
```
Home (project list)
  ├── Tap project → screen list (drill-down)
  │     ├── Tap screen → editor
  │     ├── NEW SCREEN button
  │     └── BACK button → project list
  ├── NEW PROJECT button
  └── Long-press project → rename / delete
```

### Files

**`app/index.tsx`**
- Replace flat file list with conditional rendering:
  - `selectedProjectId === null` → project list view
  - `selectedProjectId !== null` → screen list view for that project
- "NEW PROJECT" button in header (when on project list)
- "NEW SCREEN" + "BACK" buttons in header (when inside a project)

**`components/home/useHomeFileActions.ts`**
- Add: `projects`, `selectedProjectId`, `isLoadingProjects`
- Add: `handleCreateProject`, `handleOpenProject`, `handleDeleteProject`, `handleRenameProject`
- Keep existing: `handleCreate`, `handleOpen`, `handleShare`, `handleDelete` (now scoped to project)
- `handleCreate` → creates a NEW SCREEN inside selected project, or prompt to select project
- `handleOpen` → unchanged (opens editor)

**`components/home/ComponentFileListItem.tsx`**
- Add `variant: 'project' | 'screen'` prop
- Project variant: folder icon, name, screen count badge, updated date
- Screen variant: current design (file mark, file name, updated date, share/del buttons)

---

## 4. Editor — project-aware

**File:** `editor/componentNodeStore.ts`
- Add `currentProjectId: number | null` to state and `CanvasState` interface
- `startNewFile(projectId?: number)` — accepts optional project id
- `loadFile(file)` — file now includes `projectId`
- `markFileSaved(id, fileName)` — unchanged

**File:** `services/componentFileService.ts`
- `saveComponentFile` signature adds `projectId` field to `SaveComponentFileInput`

---

## 5. Export — project folder as zip

**File:** `services/projectExportService.ts` (new)

```ts
exportProjectAsZip(projectId: number): Promise<void>
```

Flow:
1. Fetch project name + all screens from DB
2. For each screen, generate `.tsx` code with screen-specific function name
3. Write to temp dir:
   ```
   {cacheDir}/{ProjectName}/
     ├── index.tsx
     ├── HomeScreen.tsx
     ├── ProfileScreen.tsx
     └── ...
   ```
4. Zip folder using `jszip`
5. Write zip to `{cacheDir}/{ProjectName}.zip`
6. Share via `expo-sharing`

Generated `index.tsx`:
```tsx
export { default as HomeScreen } from './HomeScreen';
export { default as ProfileScreen } from './ProfileScreen';
```

**File:** `export/treeToReactNative.ts`
- Accept optional `screenName: string` param
- Use `screenName` in export default function name instead of hardcoded `GeneratedScreen`
- Default fallback: `GeneratedScreen`

---

## 6. Dependencies

| Package | Why | Install |
|---------|-----|---------|
| `jszip` | In-memory zip creation | `npm install jszip` |
| `@types/jszip` | TypeScript types | `npm install -D @types/jszip` (auto with v3+) |

`expo-file-system` and `expo-sharing` are already installed.

---

## 7. File change summary

| File | Status |
|------|--------|
| `data/componentFileRepository.ts` | **modify** — add projects table, FK, CRUD |
| `editor/projectStore.ts` | **new** — zustand store |
| `editor/componentNodeStore.ts` | **modify** — +currentProjectId |
| `services/componentFileService.ts` | **modify** — +projectId on save |
| `services/projectExportService.ts` | **new** — zip export |
| `export/treeToReactNative.ts` | **modify** — dynamic function name |
| `app/index.tsx` | **modify** — project-first dual-view |
| `components/home/useHomeFileActions.ts` | **modify** — project CRUD + dual-mode |
| `components/home/ComponentFileListItem.tsx` | **modify** — project + screen variants |

---

## 8. Migration

Existing data in `component_files` has `project_id = NULL`. On first launch after migration:
- Auto-create a "Default Project" for screens with `project_id IS NULL`
- Or show an "orphan" section on the home screen

---

## 9. Implementation order

1. `data/componentFileRepository.ts` — schema + CRUD
2. `editor/projectStore.ts` — store
3. `components/home/ComponentFileListItem.tsx` — dual-mode item
4. `components/home/useHomeFileActions.ts` — project actions
5. `app/index.tsx` — new home layout
6. `editor/componentNodeStore.ts` — project-aware
7. `services/componentFileService.ts` — project-aware save
8. `export/treeToReactNative.ts` — dynamic function name
9. `services/projectExportService.ts` — zip export
10. `npm install jszip`
