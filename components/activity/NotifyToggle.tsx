import { useEffect, useState } from 'react';
import { hasNotifyPermission, requestNotifyPermission } from '@/lib/notify';

interface Props {
  on: boolean;
  onChange: (on: boolean) => void;
}

/**
 * Off and On for desktop notifications. Turning it on asks for the
 * notifications permission first, and it stays off if that's declined.
 */
export function NotifyToggle({ on, onChange }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    hasNotifyPermission().then(setAllowed);
  }, []);

  async function turnOn() {
    const ok = await requestNotifyPermission();
    setAllowed(ok);
    setDeclined(!ok);
    if (ok) onChange(true);
  }

  // Permission taken back in the browser's settings counts as off.
  const active = on && allowed === true;

  return (
    <>
      <div className="segmented" role="radiogroup" aria-label="Desktop notifications">
        <button type="button" role="radio" aria-checked={!active} className="segment" onClick={() => onChange(false)}>
          Off
        </button>
        <button type="button" role="radio" aria-checked={active} className="segment" onClick={turnOn} disabled={allowed === null}>
          On
        </button>
      </div>
      {declined && <p className="row-note">The browser didn't allow notifications, so they're still off.</p>}
    </>
  );
}
