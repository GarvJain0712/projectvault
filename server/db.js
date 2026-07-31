import mongoose from 'mongoose';

/**
 * Connect to MongoDB.
 *
 * Deliberately non-fatal: if the database is unreachable we log a clear
 * message and let the server keep running, so you get a readable API error
 * instead of a process that crash-loops before you can read the logs.
 */
export async function connectDatabase(uri) {
  if (!uri) {
    console.error('\n[db] MONGODB_URI is not set.');
    console.error('[db] Copy server/.env.example to server/.env and fill it in.\n');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('[db] connected to MongoDB');
    return true;
  } catch (error) {
    console.error('\n[db] Could not connect to MongoDB:', error.message);
    console.error('[db] Common causes:');
    console.error('     - your IP is not on the Atlas access list (Network Access → Add IP)');
    console.error('     - the password in MONGODB_URI needs URL-encoding (@ becomes %40)');
    console.error('     - the cluster is still starting up\n');
    return false;
  }
}

/** True when a live connection is available — used by the health route. */
export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}
