import { useCallback, useEffect, useState } from 'react';
import { readValue, writeValue } from '@/services/storage';

/** useState, but the value survives a page refresh. */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));

  useEffect(() => {
    writeValue(key, value);
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}
