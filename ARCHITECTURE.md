# ProjectVault — Architecture Guide

A walk through every file, what it does, and which React concept it demonstrates.
~6,000 lines across 65 source files.

---

## 1. The mental model

Data flows in one direction, top to bottom:

```
localStorage / IndexedDB      ← the browser actually stores it here
        ↑
   services/                  ← the ONLY code that touches storage
        ↑
   context/                   ← holds state in memory, exposes actions
        ↑
   hooks/                     ← reshape that state (filter, paginate, debounce)
        ↑
   pages/                     ← decide WHAT to show
        ↑
   components/                ← decide HOW it looks
```

Two rules keep it clean:

1. **A component never reads localStorage directly.** It asks a context.
2. **A context never formats a date.** It hands raw data down; the component formats.

Break either one and the app gets hard to change. Follow them and swapping
localStorage for a real backend touches exactly one folder.

---

## 2. Boot sequence

What happens when you load the page, in order:

| Step | File | What happens |
| --- | --- | --- |
| 1 | `index.html` | Browser loads the shell, finds `<div id="root">` |
| 2 | `src/main.jsx` | React mounts, wraps the app in four providers |
| 3 | `src/App.jsx` | Router matches the URL to a page |
| 4 | `src/layouts/MainLayout.jsx` | Draws sidebar + navbar + footer around the page |
| 5 | `src/pages/*.jsx` | The matched page renders |

### `src/main.jsx` — the provider tree

```jsx
<React.StrictMode>          // dev-only: double-invokes to surface bugs
  <BrowserRouter>           // URL → component matching
    <ThemeProvider>         // dark mode + accent colour
      <ToastProvider>       // notifications
        <ProjectProvider>   // your project data
          <App />
```

**Order matters.** `ProjectProvider` is innermost because it uses `useToast`
indirectly through the components it renders. A provider can only use contexts
that sit *above* it. Flip two of these and you get "must be used inside
&lt;Provider&gt;" errors.

**Concept: Provider composition.** Instead of one giant store, three focused
contexts. A component that only needs the theme won't re-render when a project
changes.

---

## 3. `src/services/` — the storage layer

Four files. **This is the only folder that knows localStorage and IndexedDB exist.**

### `storage.js`
Wraps `localStorage.getItem` / `setItem` in try/catch. Every read takes a
fallback value. Why: a corrupted entry or private-browsing mode would otherwise
throw and white-screen the whole app.

### `videoStore.js`
IndexedDB, promisified. Videos are far too large for localStorage's ~5 MB cap,
so the blob lives here and the project record keeps only a short `videoKey`
string.

**Concept: callback API → Promise.** IndexedDB is event-based
(`request.onsuccess`). `withStore()` wraps that in a Promise so the rest of the
app can just `await`.

### `projectService.js`
All six CRUD functions. **Every one is `async` even though localStorage is
synchronous** — that is deliberate. The signatures already match what a REST
API would look like:

```js
fetchProjects()            // GET    /api/projects
fetchProjectById(id)       // GET    /api/projects/:id
createProject(data)        // POST   /api/projects
updateProject(id, patch)   // PATCH  /api/projects/:id
deleteProject(id)          // DELETE /api/projects/:id
replaceAllProjects(list)   // bulk import
```

Rewrite the six bodies to call `fetch()` and the entire app keeps working
unchanged. That is the single most important design decision in this codebase.

`createEmptyProject()` also acts as a **schema guard**: `normalise()` spreads
every stored record over the defaults, so a record saved before you added a
field still gets that field instead of `undefined`.

### `activityService.js`
Append-only log for the dashboard timeline, capped at 40 entries.

---

## 4. `src/context/` — application state

### `ProjectContext.jsx` — the big one

Holds `projects`, `activity`, `loading`, and every mutation.

**Concepts used here:**

- **`useState`** — three pieces of state: the list, the activity feed, the loading flag.
- **`useEffect` with `[]`** — loads data once on mount. The `cancelled` flag in the cleanup function prevents a state update after unmount (a classic memory-leak warning).
- **`useCallback`** — every action is memoised. Without this, each render creates new function identities, and any child that depends on them re-renders too.
- **`useMemo`** — `stats` recalculates only when `projects` changes, not on every render.
- **Optimistic-ish updates** — write to the service, then update state, so the UI never waits on a spinner.

Worth studying: `registerView`. An earlier version called the service *inside*
`setProjects(...)`. That looks harmless but a state updater must be pure —
StrictMode calls it twice, so views incremented twice. It now reads and writes
outside the updater.

`toggleFlag(id, field)` is one generic function serving favourite, watch-later
and pin. **Concept: parameterise instead of duplicating.**

### `ThemeContext.jsx`

Theme, accent colour, grid/list preference — persisted to localStorage.

The clever part is how theming works. `tailwind.config.js` defines colours as
CSS variables:

```js
colors: { accent: 'rgb(var(--color-accent) / <alpha-value>)' }
```

and the provider just sets the variable:

```js
root.style.setProperty('--color-accent', settings.accent);
root.classList.toggle('dark', resolved === 'dark');
```

**Concept: CSS custom properties as a theming layer.** Eight accent colours and
two themes with zero Tailwind rebuild and zero conditional classNames.

A second `useEffect` subscribes to `matchMedia('(prefers-color-scheme: dark)')`
and cleans up its listener on unmount — the textbook subscribe/unsubscribe pattern.

### `ToastContext.jsx`

Renders `<ToastStack>` itself, so any component can call `toast.success('Saved')`
without rendering anything.

**Concept: context that owns UI, not just data.** The provider is both a state
container and a renderer.

---

## 5. `src/hooks/` — reusable logic

Seven custom hooks. A custom hook is just a function starting with `use` that
calls other hooks — the point is extracting *behaviour* so components stay
about *markup*.

| Hook | Concept it teaches |
| --- | --- |
| `useDebounce` | `useEffect` + `setTimeout` + cleanup. Search waits 250 ms so you don't filter on every keystroke. |
| `useLocalStorage` | `useState` mirrored to storage via `useEffect`. Same API as `useState`, survives refresh. |
| `useHotkey` | Global event listeners with correct cleanup. Also guards against firing while you're typing in an input. |
| `useOnClickOutside` | Working with refs and DOM `contains()`. |
| `useProjectFilters` | The biggest one — composes another hook (`useDebounce`) and derives filtered output with `useMemo`. |
| `usePagination` | Derived state + a guard `useEffect` that clamps the page number when filters shrink the list. |
| `useVideoSource` | Async resource loading with cleanup. Creates an object URL from the IndexedDB blob and **revokes it on unmount** — skip that and you leak memory on every video. |

`useProjectFilters` is the one to read first. It shows the pattern of *never
mutating* — `[...matches].sort()` copies before sorting, because `.sort()`
mutates in place and mutating state is how you get stale-render bugs.

---

## 6. `src/layouts/MainLayout.jsx`

The shell: sidebar, navbar, page, footer. Rendered once; only the page inside
swaps.

**Concept: layout routes.** In `App.jsx`, `<Route element={<MainLayout />}>`
wraps the child routes, and `<Outlet />` marks where the matched page goes. The
sidebar never unmounts, so its animation state survives navigation.

`<div key={pathname}>` around the Outlet forces a fresh mount per route so
`PageTransition` replays its entrance animation.

There's a deliberate absence here worth knowing about: the Outlet is **not**
wrapped in `<AnimatePresence mode="wait">`. Under StrictMode the double-invoked
mount can leave it waiting forever on an exit animation, blanking the page area.
The comment in the file explains it.

---

## 7. `src/components/ui/` — the primitives

Fifteen dumb components. None of them know what a "project" is — that's what
makes them reusable.

| Component | Concept |
| --- | --- |
| `Button.jsx` | **Polymorphic component.** Renders `<button>`, `<a>`, or React Router `<Link>` depending on props. Uses `forwardRef`. Variants/sizes are lookup objects, not if-chains. |
| `Modal.jsx` | **Portals.** `createPortal(..., document.body)` escapes parent `overflow: hidden`. Also: Escape key handling, scroll lock, and cleanup that restores the original overflow. |
| `ToastStack.jsx` | `AnimatePresence` for exit animations + `layout` for siblings sliding up. |
| `Loader.jsx` | **Skeleton screens.** Placeholders that mirror the real layout, so nothing jumps when data arrives. |
| `EmptyState.jsx` | Every list has three states: loading, empty, populated. Most beginner apps forget the middle one. |
| `ConfirmDialog.jsx` | **Composition** — built from `Modal` + `Button` rather than duplicating them. |
| `Pagination.jsx` | Pure logic: `buildPageList()` produces `[1, '…', 4, 5, 6, '…', 12]`. |
| `PageTransition.jsx` | One wrapper so every page animates in identically. |
| `ScrollToTop.jsx` | Passive scroll listener (`{ passive: true }`) — tells the browser it won't call `preventDefault`, so scrolling stays smooth. |
| `Field.jsx`, `Badge.jsx`, `ProgressBar.jsx`, `Tooltip.jsx` | Small, single-purpose, no state. |

---

## 8. `src/components/` — feature components

These *do* know about projects.

| Component | What to notice |
| --- | --- |
| `ProjectCard.jsx` | One component, two layouts (`view="grid"` / `"list"`). The shared bits (`actions`, `meta`, `techBadges`) are built once as variables and reused in both branches — no copy-paste. |
| `UploadForm.jsx` | **Controlled components** throughout. Handles create *and* edit via one optional `initialProject` prop. Validation returns an error object; the progress bar is a `setInterval` that resolves a Promise. |
| `CommandPalette.jsx` | Keyboard navigation (arrows, Enter, Escape), `useMemo`-filtered results, portal rendering. |
| `Sidebar.jsx` | `NAV_ITEMS` array drives both desktop rail and mobile drawer — **single source of truth**. `layoutId="sidebar-active"` makes the highlight slide between items. |
| `ProjectGrid.jsx` | Reads `viewMode` from theme context and picks the container class. Pages don't repeat grid logic. |
| `FileDropzone.jsx` | Drag-and-drop events, a hidden `<input type="file">`, and a `ref` to trigger it. |
| `TagInput.jsx` | Local draft state + commit-on-Enter. Backspace on empty input removes the last chip. |
| `ImageGallery.jsx` | Lightbox with keyboard nav, rendered conditionally. |
| `ErrorBoundary.jsx` | **The one class component in the codebase** — `getDerivedStateFromError` / `componentDidCatch` have no hook equivalent. |
| `VideoPlayer.jsx` | Delegates all the hard work to `useVideoSource`. |
| `CategoryChart.jsx` | Recharts + `ResponsiveContainer`; data shaped with `useMemo`. |

---

## 9. `src/pages/` — one file per route

Pages are **thin**. They pick data from context, run it through hooks, and hand
it to components. `AllProjects.jsx` is about 90 lines and does search, filter,
sort, paginate and three empty states — because all the logic lives elsewhere.

| Page | Route | Notable |
| --- | --- | --- |
| `Dashboard.jsx` | `/` | Six stat cards, featured project, charts, activity feed |
| `AllProjects.jsx` | `/projects` | `useProjectFilters` + `usePagination` composed together |
| `Upload.jsx` | `/upload` | Thin wrapper around `UploadForm` |
| `ProjectDetails.jsx` | `/project/:id` | `useParams`, view counting with a `useRef` guard, related-project scoring |
| `EditProject.jsx` | `/project/:id/edit` | Same form, `key={project.id}` forces fresh state between projects |
| `Favorites.jsx` | `/favorites` | Filtered view (hidden from the sidebar) |
| `WatchLater.jsx` | `/watch-later` | Filtered view (hidden from the sidebar) |
| `About.jsx` | `/about` | Pure presentation from `data/profile.js` |
| `Settings.jsx` | `/settings` | Theme, accent, layout, JSON import/export, reset |
| `NotFound.jsx` | `*` | Catch-all |

The `useRef` in `ProjectDetails` is worth understanding: it remembers whether
this project's view was already counted. **A ref persists across renders without
triggering one** — exactly what you want for a "did I already do this?" flag.
`useState` here would cause an infinite loop.

---

## 10. `src/data/` and `src/utils/`

- **`constants.js`** — categories, difficulties, sort options, accent colours, storage keys. Change a category once, it updates everywhere.
- **`profile.js`** — everything on the About page.
- **`helpers.js`** — pure functions: `formatDuration`, `formatRelativeTime`, `formatWatchTime`, `cx`, `createId`, `fileToDataUrl`, `gradientFromString`. **Pure = same input, same output, no side effects** — which is why these were the easiest things to unit-test.
- **`seedProjects.js`** — orphaned. Nothing imports it, so it's stripped from the bundle. Safe to delete.

`gradientFromString` is a small trick: it hashes the title into a hue, so every
project without a thumbnail gets a distinct but stable gradient.

---

## 11. Styling: `src/styles/index.css`

Three layers, and the order matters:

```css
@layer base       /* CSS variables, element defaults, scrollbars, focus rings */
@layer components /* .card .input .glass .hero-wash */
@layer utilities  /* .clamp-2 .no-scrollbar */
```

Colours are stored as raw `R G B` triplets, not `#hex`, specifically so Tailwind
can apply opacity modifiers: `bg-accent/10` becomes
`rgb(var(--color-accent) / 0.1)`. With a hex value that wouldn't work.

The file ends with a `prefers-reduced-motion` block that flattens every
animation for users who ask for it.

---

## 12. Concept index

Where to look if you want to study one specific thing:

| Concept | Best example |
| --- | --- |
| `useState` | `TagInput.jsx` (simple), `UploadForm.jsx` (form object) |
| `useEffect` + cleanup | `useDebounce.js`, `useVideoSource.js`, `ScrollToTop.jsx` |
| `useMemo` | `useProjectFilters.js`, `ProjectContext.jsx` (stats) |
| `useCallback` | `ProjectContext.jsx` (every action) |
| `useRef` | `ProjectDetails.jsx` (view guard), `FileDropzone.jsx` (DOM access) |
| `useContext` | `useProjects()`, `useTheme()`, `useToast()` |
| Custom hooks | all of `src/hooks/` |
| Context API | all of `src/context/` |
| Portals | `Modal.jsx`, `ToastStack.jsx`, `CommandPalette.jsx` |
| Error boundaries | `ErrorBoundary.jsx` |
| `forwardRef` | `Button.jsx` |
| Conditional rendering | `AllProjects.jsx` (loading / empty / results) |
| Lists and keys | `ProjectGrid.jsx` |
| Controlled inputs | `UploadForm.jsx`, `SearchBar.jsx` |
| Derived state | `useProjectFilters.js` — filters are computed, never stored |
| Composition over props | `ConfirmDialog` = `Modal` + `Button` |
| Layout routes + `Outlet` | `App.jsx` + `MainLayout.jsx` |
| URL params | `ProjectDetails.jsx` (`useParams`) |
| Programmatic navigation | `UploadForm.jsx` (`useNavigate`) |
| Async data loading | `ProjectContext.jsx` |
| Promise-wrapping a callback API | `videoStore.js` |
| Animation | `PageTransition.jsx`, `ProjectCard.jsx`, `Sidebar.jsx` (`layoutId`) |

---

## 13. Suggested reading order

If you want to actually understand it rather than skim:

1. `main.jsx` → `App.jsx` → `MainLayout.jsx` — how the app assembles
2. `services/storage.js` → `services/projectService.js` — where data lives
3. `context/ProjectContext.jsx` — how data reaches components
4. `hooks/useProjectFilters.js` — how derived state works
5. `pages/AllProjects.jsx` — a page tying it all together
6. `components/ProjectCard.jsx` — a component with real complexity
7. `components/ui/Button.jsx` — how a good primitive is designed

---

## 14. Where to extend it

- **Add a field to projects** → `createEmptyProject()` in `projectService.js`, then a `<Field>` in `UploadForm.jsx`, then display it in `ProjectDetails.jsx`.
- **Add a page** → file in `pages/`, `<Route>` in `App.jsx`, entry in `NAV_ITEMS` in `Sidebar.jsx`.
- **Add a filter** → a key in `INITIAL_FILTERS`, a condition in the `.filter()`, a `<Select>` in `FilterBar.jsx`.
- **Add a backend** → rewrite the six functions in `projectService.js`. Nothing else changes.
