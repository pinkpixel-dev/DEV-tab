import { useCallback, useEffect, useState } from 'react';
import { getSettings, settingsItem, updateSettings, type Settings } from '@/lib/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
    // Keeps every open tab in sync when settings change somewhere else.
    return settingsItem.watch(() => {
      getSettings().then(setSettings);
    });
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    setSettings(await updateSettings(patch));
  }, []);

  return { settings, update };
}
