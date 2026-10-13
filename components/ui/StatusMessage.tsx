import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import './status.css';

interface Props {
  icon: LucideIcon;
  title: string;
  detail?: string;
  action?: { label: string; onClick: () => void };
  tone?: 'neutral' | 'danger';
}

export function StatusMessage({ icon: Icon, title, detail, action, tone = 'neutral' }: Props) {
  return (
    <div className={`status status-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={22} aria-hidden="true" />
      <p className="status-title">{title}</p>
      {detail && <p className="status-detail">{detail}</p>}
      {action && (
        <button type="button" className="btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

interface BannerProps {
  icon: LucideIcon;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function Banner({ icon: Icon, children, action }: BannerProps) {
  return (
    <div className="banner" role="status">
      <Icon size={16} aria-hidden="true" />
      <span>{children}</span>
      {action && (
        <button type="button" className="banner-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
