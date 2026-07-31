# Where Your Data Actually Lives — and What a Backend Would Change

Written for ProjectVault, but the concepts apply to any web app.

---

## 1. Yes, you are running entirely locally right now

Two different things are both "local", and mixing them up is the source of most
of the confusion:

**Local thing #1 — the web server.** When you run `npm run dev`, Vite starts a
small server on your machine at `http://localhost:5173`. It hands HTML, CSS and
JavaScript to your browser. Only your computer can reach it. Nobody else on the
internet can open that address.

**Local thing #2 — the data.** Your projects and your uploaded video are stored
*inside your browser*, not on the Vite server. Vite never sees them. If you
stopped Vite and served the same files from a different tool, the data would
still be there — because it was never in Vite to begin with.

This matters because these two are independent. Deploying to Vercel fixes #1
(anyone can reach the site) but does nothing about #2 (each visitor still has
their own empty browser storage).

---

## 2. Where your DIP video physically is, right now

You uploaded a 15 MB `.mp4`. Here is what happened to it:

```
You pick the file
      ↓
Browser hands the app a File object (still just a pointer to the file on disk)
      ↓
src/services/videoStore.js  →  saveVideo(key, blob)
      ↓
IndexedDB, database "projectvault", store "videos", key "vid_xxxxx"
```

On Windows, Chrome keeps that here:

```
C:\Users\ASUS\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\
    http_localhost_5173.indexeddb.leveldb\
```

The project's text — title, description, tags — went somewhere else:

```
C:\Users\ASUS\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb\
```

under the key `pv:projects`. That record holds only a short string like
`videoKey: "vid_m4x8p2_a91f"` — a receipt that says "the actual file is in
IndexedDB under this name".

### Why two different places?

localStorage has a hard limit of roughly **5 MB per site** and only stores text.
Your video is 15 MB of binary. It simply does not fit. IndexedDB has no
practical size limit and stores binary blobs natively. So:

- **localStorage** → small text records (your project metadata)
- **IndexedDB** → large binary files (your video)

---

## 3. What "tied to the browser" really means

Browser storage is scoped to an **origin** — the combination of protocol +
domain + port. These are all *different* storage buckets:

| Origin | Sees your video? |
| --- | --- |
| `http://localhost:5173` | Yes — this is where you saved it |
| `http://localhost:3000` | No — different port, different bucket |
| `http://127.0.0.1:5173` | No — different hostname, even though it's the same machine |
| `https://your-site.vercel.app` | No |
| Chrome Incognito | No |
| Firefox on the same PC | No |
| Your phone | No |

So your video is not "in your project folder". It is not in `src/`. It is not in
git. Copying your project folder to another laptop copies zero projects. Running
"Clear browsing data" in Chrome deletes it permanently.

That is the real limitation — not size, not speed. **The data cannot travel.**

---

## 4. What a backend actually is

A backend is just **a second program that runs somewhere else and owns the
data**. That's it. No magic.

Right now you have one program:

```
┌─────────────────────────────┐
│  Browser (Chrome)           │
│  ┌───────────────────────┐  │
│  │ React app             │  │
│  │        ↕              │  │
│  │ localStorage          │  │  ← data lives here
│  │ IndexedDB             │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

With a backend you have two, talking over HTTP:

```
┌──────────────────┐         ┌──────────────────────────────┐
│ Browser          │  HTTP   │  Server (Node/Express)       │
│ ┌──────────────┐ │ ──────► │                              │
│ │ React app    │ │  fetch  │  ┌────────────────────────┐  │
│ │              │ │ ◄────── │  │ MongoDB   ← metadata   │  │
│ └──────────────┘ │  JSON   │  └────────────────────────┘  │
│                  │         │  ┌────────────────────────┐  │
│  no data stored  │         │  │ File storage ← videos  │  │
└──────────────────┘         │  └────────────────────────┘  │
                             └──────────────────────────────┘
```

The React app stops being the owner of the data and becomes a **viewer** of it.
Every browser, every device, every visitor asks the same server and gets the
same answer. That is the entire point.

Note there are still **two** storage systems on the server side, for exactly the
same reason as before: databases are built for structured records, not 15 MB
binary files.

---

## 5. What happens when you upload, step by step

**Today (no backend):**

1. You pick `WhatsApp Video.mp4`
2. `readVideoDuration()` reads its length without playing it
3. `saveVideo()` writes the blob to IndexedDB, returns key `vid_abc123`
4. The project record — with `videoKey: "vid_abc123"` — goes to localStorage
5. To play it, `useVideoSource` fetches the blob back and calls
   `URL.createObjectURL(blob)`, producing a temporary address like
   `blob:http://localhost:5173/8f3a...` that the `<video>` tag can use

**With a backend:**

1. You pick the same file
2. The browser POSTs it to `http://localhost:4000/api/upload` as `multipart/form-data`
3. The server receives the bytes and saves them — to disk, or forwards them to a
   cloud storage service
4. The server responds with a permanent URL, e.g.
   `https://res.cloudinary.com/you/video/upload/v1/dip-project.mp4`
5. The browser POSTs the project metadata (including that URL) to
   `http://localhost:4000/api/projects`
6. MongoDB stores the record
7. To play it, the `<video>` tag just uses the URL directly — no blob, no
   IndexedDB, works on any device

Notice step 4. **The database never holds the video.** It holds a string
pointing at the video. Same pattern as `videoKey` today, just pointing somewhere
the whole internet can reach.

---

## 6. The three places a video can go — honest comparison

### Option A — the server's own disk

Express uses a library called `multer` to write the incoming file into an
`uploads/` folder sitting next to your server code.

- **Good:** easiest to picture. The file is a real file you can open in Explorer.
- **Bad:** free hosts (Render, Railway, Vercel) use *ephemeral* filesystems. Your
  server restarts — on deploy, on idle, on crash — and the folder is wiped. Your
  videos disappear while the database still points at them, so you get broken
  players.
- **Verdict:** fine for learning on your own machine. Not viable deployed.

### Option B — cloud storage (Cloudinary, Firebase Storage, AWS S3)

The file goes to a service built for holding files. It returns a permanent URL.

- **Good:** survives restarts and redeploys. Served from a CDN, so playback is
  fast from anywhere. Cloudinary's free tier (~25 GB) also auto-generates
  thumbnails and can transcode video.
- **Bad:** one more account, one more API key to keep out of git.
- **Verdict:** this is what real applications do. Recommended.

### Option C — store the bytes inside the database

MongoDB has GridFS, which chops files into chunks and stores them in the
database itself.

- **Good:** one system instead of two. Nothing to configure.
- **Bad:** databases are optimised for querying small records. Streaming video
  through one is slow, bloats your backups, and burns through free-tier storage
  quotas fast.
- **Verdict:** technically works, generally a mistake. Skip it.

### Option D — don't host video at all

Upload to YouTube (unlisted), store the link. Your app only ever handles text.

- **Good:** zero storage cost, zero upload code, unlimited size, and YouTube
  handles quality switching and mobile playback.
- **Bad:** you're not building the upload feature, and the content lives on
  someone else's platform.
- **Verdict:** genuinely the smart choice for a portfolio site. Your app already
  supports it — the "paste a video URL" field in the upload form.

---

## 7. What would change in your code

Surprisingly little, and this was designed in from the start.

`src/services/projectService.js` has six functions. Today their bodies read and
write localStorage. With a backend, their bodies call `fetch()`:

```js
// today
export async function fetchProjects() {
  return readAll();                      // localStorage
}

// with a backend
export async function fetchProjects() {
  const res = await fetch('http://localhost:4000/api/projects');
  return res.json();
}
```

The function name, its arguments, and the shape of what it returns all stay the
same. That's why **no page, no component and no hook has to change** — they only
ever call `fetchProjects()` and don't care how it gets the data.

The same applies to `saveVideo()` in `videoStore.js`: today it writes to
IndexedDB and returns a key, tomorrow it POSTs to an upload endpoint and returns
a URL.

This is what the phrase "backend-ready architecture" in the README meant. It
wasn't decoration — it's the reason this migration is a one-folder change
instead of a rewrite.

---

## 8. A sensible order to do this in

If and when you decide to build it:

1. **Get MongoDB running** — use MongoDB Atlas (free cloud tier) rather than
   installing it locally. Less to go wrong.
2. **Write the Express server** — about 100 lines: five routes, one Mongoose
   model, CORS enabled so `localhost:5173` may call `localhost:4000`.
3. **Rewrite the six functions** in `projectService.js` to use `fetch`. Test
   that everything still works with text-only projects.
4. **Add video upload last** — it's the fiddliest part, so get the boring parts
   solid first.
5. **Deploy** — server to Render, database already on Atlas, frontend to Vercel,
   videos to Cloudinary.

Steps 1–3 are one focused session. Don't try to do all five at once.

---

## 9. The one-sentence version

Right now your data lives inside Chrome on your laptop and can't leave; a
backend moves it to a program that everyone's browser can talk to, with the
video file itself going to storage built for files and only its URL going into
the database.
