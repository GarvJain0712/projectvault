# Backend Setup — Free, Start to Finish

Everything below has a permanent free tier. No card required for any step.

| Piece | Service | Free allowance |
| --- | --- | --- |
| Database | MongoDB Atlas (M0) | 512 MB |
| Video + image files | Cloudinary | ~25 GB storage, 25 GB/month bandwidth |
| API hosting | Render | 750 hours/month (sleeps when idle) |
| Frontend hosting | Vercel | 100 GB/month bandwidth |

You do **not** need all four to start. Steps 1–5 get it running on your own
machine; steps 6–10 put it online safely.

---

## How the two modes work

The app reads one environment variable, `VITE_API_URL`:

- **not set** → local mode. Projects in localStorage, videos in IndexedDB. This
  is how it has worked so far, and it still works with the server switched off.
- **set** → API mode. Everything goes to your Express server and MongoDB.

Settings → Storage shows which mode you're in and whether the API is reachable.

---

## Step 1 — Create the database (5 minutes)

1. Go to **mongodb.com/cloud/atlas/register** and sign up.
2. Create a cluster: choose the **M0 Free** tier, pick a region near you
   (Mumbai if you're in India), and create it. Provisioning takes a few minutes.
3. **Database Access** → Add New Database User. Pick a username and password.
   Write the password down — you cannot view it again.
4. **Network Access** → Add IP Address → **Allow Access From Anywhere**
   (`0.0.0.0/0`). This is the step people forget, and skipping it produces a
   connection timeout with no clear cause.
5. **Database** → Connect → Drivers. Copy the connection string. It looks like:

```
mongodb+srv://garv:<password>@cluster0.ab12c.mongodb.net/?retryWrites=true&w=majority
```

Two edits before you use it:

- Replace `<password>` with your real password.
- Insert the database name before the `?`, so it ends with
  `.mongodb.net/projectvault?retryWrites=...`

If your password contains `@`, `#`, `/` or `:`, URL-encode it (`@` → `%40`).
This is the second most common cause of a failed connection.

---

## Step 2 — Configure and start the server

```powershell
cd "C:\Users\ASUS\Desktop\web dev\protfolio\server"
copy .env.example .env
npm install
```

Open `server/.env` and set `MONGODB_URI` to the string from step 1. Leave
`CLOUDINARY_URL` empty for now — uploads will go to `server/uploads/`.

```powershell
npm run dev
```

You should see:

```
[db] connected to MongoDB

  ProjectVault API
  ➜  http://localhost:4000/api/health
  ➜  storage: local disk (./uploads)
```

Open http://localhost:4000/api/health in a browser. You want
`"database":"connected"`. If it says `disconnected`, the terminal will tell you
why — almost always the IP access list or the password encoding.

---

## Step 3 — Back up what you already have (do this FIRST)

Your existing projects are inside your browser. The moment you switch modes the
app stops reading from there, so save them out **before** switching.

1. Start the app the normal way if it isn't running: in a terminal at the
   project root, `npm run dev`
2. Open http://localhost:5173
3. Go to **Settings → Your data → Export as JSON**
4. A file called `projectvault-export-YYYY-MM-DD.json` lands in your Downloads
   folder. Leave it there.

If you have no projects yet, skip this step entirely.

---

## Step 4 — Switch the frontend to API mode

You now need **two terminals running at the same time** — one for the server,
one for the website. In VS Code, press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> +
<kbd>`</kbd> to open a second one.

**Terminal 1 — the server** (leave it running):

```powershell
cd "C:\Users\ASUS\Desktop\web dev\protfolio\server"
npm run dev
```

**Terminal 2 — the website.** First stop the old dev server with
<kbd>Ctrl</kbd> + <kbd>C</kbd> if it's running, then:

```powershell
cd "C:\Users\ASUS\Desktop\web dev\protfolio"
copy .env.example .env
npm run dev
```

That `copy` command makes a real `.env` file from the example. It already
contains `VITE_API_URL=http://localhost:4000`, which is the switch that puts the
app into API mode.

Vite only reads `.env` when it starts, so it **must** be a fresh start — editing
the file while it runs does nothing.

Now open http://localhost:5173 and go to **Settings → Storage**. You want:

> **Server mode** · green dot · API reachable · database: connected · files: disk

Your projects will look like they've vanished. That's expected — you're now
looking at an empty MongoDB, not your browser. Step 5 brings them back.

---

## Step 5 — Import your projects into MongoDB

1. Still in API mode, go to **Settings → Your data → Import from JSON**
2. Pick the file you exported in step 3
3. A toast confirms how many projects were imported

Everything transfers except uploaded video files — those were in IndexedDB and
can't be exported. Open each project, hit **Edit**, and re-upload the video.
This time it goes to the server.

Want your old browser data back? Delete the `.env` file, restart `npm run dev`,
and you're in local mode again with everything untouched.

---

## Step 6 — Cloudinary, so files survive deployment

Skip this while working locally. Do it before deploying, because free hosts wipe
their filesystem on every restart — your videos would vanish while the database
still pointed at them.

1. Sign up at **cloudinary.com** (free "Programmable Media" plan).
2. On the dashboard, find **API Environment variable**. It looks like:
   `cloudinary://123456789:abcdefg_hijklmn@your-cloud-name`
3. Paste it into `server/.env` as `CLOUDINARY_URL=...`
4. Restart the server. The banner should now read `storage: Cloudinary`.

Nothing else changes — the upload route detects the variable and switches from
disk to Cloudinary automatically. Cloudinary also reports real video duration,
which the app stores.

---

## Step 7 — Lock writes with an admin key

Until now, anyone who knows your API address can delete your projects. Reading
stays public — that's the point of a portfolio — but writing should not be.

Generate a long random key. In PowerShell:

```powershell
[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
```

Put it in **one** place only — `server/.env`:

```
ADMIN_KEY=paste-the-generated-value-here
```

The frontend deliberately has no copy. Instead you type the password into the
app once per device.

Restart the server. The banner should say `writes: key required`.

### Unlocking a device

Open the app and click the **padlock** in the top bar → type the password →
Unlock. That device now remembers it (in localStorage) until you lock it again.

Do this on your laptop and on your phone. Anyone else sees a read-only site:
no New Project button, no edit or delete on cards, no comment box, and the
Upload page tells them the device is locked.

Verify from a terminal that a stranger really is refused:

```powershell
curl.exe -X DELETE https://your-api.onrender.com/api/projects/anything
```

You should get `401` and "Write access requires the admin password."

### What stays public

View counts still increment for everyone — `POST /api/projects/:id/view` is
mounted outside the guard on purpose, so visitors browsing your portfolio are
counted without needing the password.

### What this is and isn't

The password never enters your build output, so someone inspecting the deployed
site finds nothing. It is stored in your own browser after you type it.

It is still a single shared password rather than user accounts, and it travels
in a header on every write — fine over HTTPS, which both Render and Vercel give
you automatically. For a personal project library this is the right amount of
machinery. If this ever holds anything genuinely sensitive, replace
`server/auth.js` with real accounts and short-lived tokens.

---

## Step 8 — Push to GitHub

Render and Vercel both deploy from a repository.

**First, confirm your secrets are ignored.** From the project root:

```powershell
git init
git status
```

Look through the list. You must **not** see `.env`, `server/.env`, or
`node_modules`. If you do, stop — the `.gitignore` files are not being picked
up, and pushing would publish your database password and Cloudinary secret.

Then:

```powershell
git add .
git commit -m "ProjectVault: React frontend + Express/MongoDB API"
```

Create an empty repository on **github.com/new** — no README, no .gitignore,
since you already have those. Copy the URL it shows you and run:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/projectvault.git
git push -u origin main
```

Refresh the GitHub page. You should see your files, and **no** `.env` anywhere.

If you ever do commit a secret by accident: rotate it (new Atlas password, new
Cloudinary key, new admin key) rather than just deleting the file. Once it is
in git history, it is public.

---

## Step 9 — Deploy the API to Render

1. Push the whole project to GitHub.
2. At **render.com** → New → Web Service → connect your repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (Render's dashboard, not the `.env` file):
   - `MONGODB_URI` — same string as step 1
   - `CLOUDINARY_URL` — from step 6
   - `CORS_ORIGIN` — your Vercel URL, e.g. `https://projectvault.vercel.app`
   - `PUBLIC_URL` — your Render URL, e.g. `https://projectvault-api.onrender.com`
   - `ADMIN_KEY` — the key from step 7
5. Deploy, then open `https://your-api.onrender.com/api/health` to confirm.

**Free-tier catch:** Render sleeps a service after 15 minutes idle. The next
request takes 30–50 seconds to wake it. Fine for a portfolio; surprising if you
don't expect it.

---

## Step 10 — Deploy the frontend to Vercel

1. **vercel.com** → Add New Project → import the same repo.
2. Root Directory: leave as the repo root. Vite is detected automatically.
3. Add one environment variable:
   - `VITE_API_URL` = `https://your-api.onrender.com`

   There is no admin key here — you unlock the live site with the padlock
   button, exactly as you do locally.
4. Deploy.

`vercel.json` already handles SPA routing, so `/projects` works on a direct
visit.

**Important:** `VITE_API_URL` is baked in at build time, not read at runtime. If
you change it, you must redeploy.

---

## Troubleshooting

**"Cannot reach the server" banner in the app**
The API isn't running or the URL is wrong. Check `VITE_API_URL` has no trailing
slash and that http://localhost:4000/api/health responds.

**`Database unavailable` from the API**
Mongo isn't connected. Look at the server terminal — it prints the specific
reason. Usually Network Access or an unencoded password.

**CORS error in the browser console**
Your frontend's origin isn't in `CORS_ORIGIN` on the server. Add it
(comma-separated for multiple) and restart.

**Upload fails with 413**
The file is over `MAX_UPLOAD_MB` (default 200). Raise it in `server/.env`, but
note Render's free tier also has request limits — Cloudinary is the better
answer for large files.

**Changed `.env` and nothing happened**
Both Vite and the server read env vars at startup. Restart them.

---

## What each file does

```
server/
├── index.js            Express app: CORS, JSON parsing, routes, error handler
├── db.js               MongoDB connection (fails soft, with readable diagnostics)
├── models/Project.js   Mongoose schema — mirrors createEmptyProject() on the frontend
├── routes/projects.js  GET / GET:id / POST / PATCH / DELETE / PUT (bulk)
├── routes/upload.js    multer → Cloudinary, or → ./uploads on disk
├── uploads/            local files in disk mode (gitignored)
└── .env                your secrets (gitignored — never commit this)
```

Frontend additions:

```
src/services/apiClient.js       fetch wrapper, XHR upload with real progress, health check
src/services/projectService.js  each function branches: API mode or localStorage
src/services/videoStore.js      storeVideo() → upload endpoint, or IndexedDB
src/components/ConnectionBanner.jsx   shown when the API can't be reached
```

If you add a field to a project, change it in **two** places:
`createEmptyProject()` in `projectService.js`, and the schema in
`server/models/Project.js`.
