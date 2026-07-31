/** Append-only activity feed shown on the Dashboard timeline. */

import { STORAGE_KEYS } from '@/data/constants';
import { createId } from '@/utils/helpers';
import { readValue, writeValue } from './storage';

const MAX_ENTRIES = 40;

export function getActivity() {
  const stored = readValue(STORAGE_KEYS.activity, []);
  return Array.isArray(stored) ? stored : [];
}

/**
 * @param {'created'|'updated'|'deleted'|'favorited'|'watchLater'|'liked'|'commented'|'imported'} type
 */
export function logActivity(type, message, projectId = null) {
  const entry = {
    id: createId('act'),
    type,
    message,
    projectId,
    at: new Date().toISOString(),
  };
  const next = [entry, ...getActivity()].slice(0, MAX_ENTRIES);
  writeValue(STORAGE_KEYS.activity, next);
  return next;
}

export function clearActivity() {
  writeValue(STORAGE_KEYS.activity, []);
  return [];
}
