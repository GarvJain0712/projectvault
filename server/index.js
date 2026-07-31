import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDatabase, isDatabaseReady } from './db.js';
import { isWriteProtected, requireWriteKey, warnIfUnprotected } from './auth.js';
import projectRoutes, { incrementView } from './routes/projects.js';
import uploadRoutes, { isCloudinaryActive } from './routes/upload.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 4000);

/* ---------------------------------------------------------------- middleware */

// Which frontends are allowed to call this API.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No origin = curl, Postman, same-origin requests. Allow those.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);

// Project records carry base64 thumbnails, so the default 100 kb limit is too small.
app.use(express.json({ limit: '25mb' }));

// Serve locally-stored uploads (disk mode only).
app.use('/uploads', express.static(path.join(dirname, 'uploads'), { maxAge: '1d' }));

/* -------------------------------------------------------------------- routes */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: isDatabaseReady() ? 'connected' : 'disconnected',
    storage: isCloudinaryActive() ? 'cloudinary' : 'disk',
    writeProtected: isWriteProtected(),
    time: new Date().toISOString(),
  });
});

/*
 * Password check for the "unlock" flow.
 * POST is a write method, so requireWriteKey guards it: a wrong password gets
 * 401 and never reaches the handler. The password itself is never returned.
 */
app.post('/api/auth/verify', requireWriteKey, (req, res) => {
  res.json({ ok: true, writeProtected: isWriteProtected() });
});

// Registered before the guarded router so it stays public.
app.post('/api/projects/:id/view', incrementView);

// requireWriteKey lets every GET through and guards everything else.
app.use('/api/projects', requireWriteKey, projectRoutes);
app.use('/api/upload', requireWriteKey, uploadRoutes);

app.use((req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.path}` }));

/* ------------------------------------------------------------ error handling */

// Four arguments marks this as Express's error handler — don't remove `next`.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const isTooLarge = error?.code === 'LIMIT_FILE_SIZE';
  const status = isTooLarge ? 413 : error.status || 500;

  console.error('[error]', error.message);
  res.status(status).json({
    error: isTooLarge
      ? `File is larger than the ${process.env.MAX_UPLOAD_MB || 200} MB limit`
      : error.message || 'Something went wrong',
  });
});

/* --------------------------------------------------------------------- start */

async function start() {
  await connectDatabase(process.env.MONGODB_URI);
  warnIfUnprotected();

  app.listen(PORT, () => {
    console.log(`\n  ProjectVault API`);
    console.log(`  ➜  http://localhost:${PORT}/api/health`);
    console.log(`  ➜  storage: ${isCloudinaryActive() ? 'Cloudinary' : 'local disk (./uploads)'}`);
    console.log(`  ➜  writes: ${isWriteProtected() ? 'key required' : 'OPEN (no ADMIN_KEY set)'}`);
    console.log(`  ➜  allowed origins: ${allowedOrigins.join(', ')}\n`);
  });
}

start();
