/**
 * Write protection.
 *
 * Reads (GET) stay public so anyone can browse your portfolio.
 * Writes (POST / PATCH / PUT / DELETE) require a secret key sent in the
 * `x-admin-key` header, which only your own browser has.
 *
 * This is deliberately not a login system — there is one user (you), so a
 * shared secret is the honest amount of machinery for the job. If you ever
 * want real accounts, this is the file to replace.
 */

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** True when an ADMIN_KEY is configured, i.e. writes are actually locked. */
export function isWriteProtected() {
  return Boolean((process.env.ADMIN_KEY || '').trim());
}

/** Warn loudly at startup if the API is deployed wide open. */
export function warnIfUnprotected() {
  if (isWriteProtected()) return;
  console.warn('\n[auth] ADMIN_KEY is not set — anyone can add, edit or delete projects.');
  console.warn('[auth] Fine on localhost. Set it before you deploy.\n');
}

export function requireWriteKey(req, res, next) {
  if (READ_METHODS.has(req.method)) return next();

  const expected = (process.env.ADMIN_KEY || '').trim();

  // No key configured: allow writes so local development isn't blocked.
  if (!expected) return next();

  const provided = req.get('x-admin-key');
  if (provided && provided === expected) return next();

  return res.status(401).json({
    error: 'Write access requires the admin password.',
    hint: 'Unlock this device with the padlock button in the app, using the value of ADMIN_KEY.',
  });
}
