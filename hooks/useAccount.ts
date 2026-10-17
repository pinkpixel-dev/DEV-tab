import { useEffect, useState } from 'react';
import { accountItem, apiKeyItem, disconnectAccount, hasKeyConsent } from '@/lib/account';
import type { Account } from '@/lib/api/types';

export function useAccount() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([apiKeyItem.getValue(), accountItem.getValue(), hasKeyConsent()]).then(async ([key, acct, consent]) => {
      // Consent withdrawn in Firefox's add-on settings: drop the key instead
      // of sending it again.
      if (key && !consent) {
        await disconnectAccount();
        key = null;
        acct = null;
      }
      setApiKey(key);
      setAccount(acct);
      setReady(true);
    });
    const unwatchKey = apiKeyItem.watch(setApiKey);
    const unwatchAccount = accountItem.watch(setAccount);
    return () => {
      unwatchKey();
      unwatchAccount();
    };
  }, []);

  return { apiKey, account, ready };
}
