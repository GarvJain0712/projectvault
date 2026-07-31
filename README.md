# ProjectVault

A personal library for your project explanation videos — upload, organise, search and watch everything you've built, in one place.

Built with React (Vite), React Router, Tailwind CSS, Framer Motion and React Icons. Data persists in the browser today, and the service layer is shaped so a real backend can be dropped in later.

---

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Other scripts:

```bash
npm run build     # production build into /dist
npm run preview   # preview the production build locally
```

The vault starts empty. Add your first project from **Upload Video**, or import a JSON backup from **Settings**.

---

## Making it yours

| What | Where |
| --- | --- |
| Your name, bio, skills, education, social links, resume | `src/data/profile.js` |
| Categories, difficulty levels, accent colours, page size | `src/data/constants.js` |
| Colour tokens for light/dark | `src/styles/index.css` |

To add your resume: drop `resume.pdf` into `/public` and set `resume: '/resume.pdf'` in `profile.js`.

---

## Pages

| Route | Page |
| --- | --- |
| `/` | Dashboard — stats, featured project, charts, recent uploads, activity timeline |
| `/projects` | All Projects — search, filter, sort, paginate |
| `/upload` | Upload Video — full project form with progress animation |
| `/project/:id` | Project Details — player, features, gallery, resources, comments, related |
| `/project/:id/edit` | Edit Project — the same form, pre-filled |
| `/favorites` | Favorites |
| `/watch-later` | Watch Later |
| `/about` | About Me |
| `/settings` | Settings — theme, accent colour, layout, import/export, reset |
| anything else | 404 |

---

## Folder structure

```
src/
├── components/          Reusable pieces
│   ├── ui/              Primitives: Button, Modal, Toast, Badge, Skeleton…
│   ├── Navbar.jsx       App chrome
│   ├── Sidebar.jsx
│   ├── Footer.jsx
│   ├── ProjectCard.jsx  Grid + list card with all row actions
│   ├── VideoCard.jsx    Compact row used in sidebars
│   ├── UploadForm.jsx   Shared create/edit form
│   ├── VideoPlayer.jsx
│   ├── CommandPalette.jsx
│   └── …
├── pages/               One file per route
├── layouts/             MainLayout (shell + page transitions)
├── context/             ProjectContext, ThemeContext, ToastContext
├── hooks/               useDebounce, useProjectFilters, usePagination, useHotkey…
├── services/            storage, videoStore (IndexedDB), projectService, activityService
├── utils/               helpers.js — formatting, ids, file readers
├── data/                constants.js, profile.js
├── styles/              index.css — Tailwind + design tokens
├── App.jsx              Route table
└── main.jsx             Entry point and provider tree
```

---

## How data is stored

Two stores, on purpose:

- **localStorage** holds project records, settings and the activity log. Small, synchronous, easy to inspect.
- **IndexedDB** holds uploaded video blobs, which are far too large for localStorage. The project record only keeps a short `videoKey`.

`src/services/projectService.js` is the single door to project data. Every function is already `async`:

```js
fetchProjects()            // GET    /api/projects
fetchProjectById(id)       // GET    /api/projects/:id
createProject(data)        // POST   /api/projects
updateProject(id, patch)   // PATCH  /api/projects/:id
deleteProject(id)          // DELETE /api/projects/:id
replaceAllProjects(list)   // bulk import
```

To move to Firebase or Node + Express + MongoDB, rewrite the bodies of those six functions. No component, hook or page needs to change. Video uploads follow the same pattern in `src/services/videoStore.js` — swap `saveVideo`/`getVideo` for uploads that return a URL.

---

## Features

**Browsing** — search across titles, descriptions, technologies and tags; filter by category, difficulty, status and technology; sort by latest, oldest, A–Z or most viewed; grid or list layout; pagination.

**Per project** — favourite, watch later, pin to dashboard, like, view counter, share, edit, delete, comments, image gallery with lightbox, resources, notes, related projects.

**Interface** — light/dark/system theme, eight accent colours, page transitions, hover animations, loading skeletons, empty states, toast notifications, scroll-to-top, 404 page, fully responsive.

**Power features** — command palette on <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>, dashboard charts, activity timeline, completion progress bars, JSON import/export.

---

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd> | Open the command palette |
| <kbd>↑</kbd> <kbd>↓</kbd> | Move through palette results |
| <kbd>Enter</kbd> | Run the highlighted result |
| <kbd>Esc</kbd> | Close the palette or any modal |

---

## Deploying

Build command `npm run build`, output directory `dist`.

Because this is a client-side router, the host **must** rewrite unknown paths to
`index.html` — otherwise a direct visit to `/projects` returns 404. Config for
both common hosts is already in the repo:

- `vercel.json` — Vercel
- `public/_redirects` — Netlify

**Vercel** — push to GitHub, then "Add New Project" at vercel.com and import the
repo. Framework preset is detected as Vite; accept the defaults and deploy.

**Netlify** — same flow at app.netlify.com, or drag the `dist/` folder onto the
dashboard for a one-off deploy.

**GitHub Pages** needs two extra changes because the site lives under a
sub-path, and Pages has no rewrite support:

1. In `vite.config.js`, add `base: '/<your-repo-name>/'`
2. In `src/main.jsx`, swap `BrowserRouter` for `HashRouter` (URLs become `/#/projects`)

### Important: your data does not deploy with the site

Projects live in the visitor's own browser. A deployed build starts **empty**
for everyone who opens it — your uploaded videos stay on your machine.

For a portfolio piece you actually want people to see, do this instead:

1. Host each video somewhere public (YouTube, Cloudinary, Google Drive direct link)
2. Add the projects using the **video URL** field rather than file upload
3. Settings → **Export as JSON**
4. Commit that file as `src/data/seedProjects.js` and load it on first run

URL-based videos survive an export/import round trip; uploaded blobs live in
IndexedDB and do not. The alternative is a real backend — see the service-layer
notes above.

---

## Notes and limits

- Everything is stored in **your browser**. Clearing site data clears the vault — export a JSON backup from Settings first.
- JSON export includes metadata, links, notes and comments, but **not** uploaded video blobs. Videos you added by URL survive an export/import round trip; uploaded files do not.
- localStorage caps out around 5 MB. Thumbnails and screenshots are stored as base64, so very large images will eat into that quota quickly. Moving media to a backend or object storage is the natural next step.
