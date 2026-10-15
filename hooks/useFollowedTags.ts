import { useEffect, useState } from 'react';
import { getFollowedTags } from '@/lib/follows';

// Followed tag names, heaviest first. Null without a key, or until they load.
export function useFollowedTags(apiKey: string | null): string[] | null {
  const [tags, setTags] = useState<string[] | null>(null);

  useEffect(() => {
    setTags(null);
    if (!apiKey) return;
    let live = true;
    getFollowedTags(apiKey)
      .then((list) => live && setTags(list.map((t) => t.name)))
      // The chips fall back to your saved tags if this fails.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [apiKey]);

  return tags;
}
