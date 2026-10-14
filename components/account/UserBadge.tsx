import type { Account } from '@/lib/api/types';
import './account.css';

export function UserBadge({ account }: { account: Account }) {
  return (
    <a
      className="user-badge"
      href={`https://dev.to/${account.username}`}
      title={`@${account.username} on DEV`}
      aria-label={`Your DEV profile (@${account.username})`}
    >
      {account.image ? (
        <img src={account.image} alt="" width={30} height={30} />
      ) : (
        <span className="user-badge-initial">{account.username.slice(0, 1).toUpperCase()}</span>
      )}
    </a>
  );
}
