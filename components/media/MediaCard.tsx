import { Mic, Video } from 'lucide-react';
import type { MediaItem } from '@/lib/api/media';
import type { Density } from '@/lib/settings';

interface Props {
  item: MediaItem;
  density: Density;
}

const KIND = {
  podcast: { Icon: Mic, label: 'Podcast' },
  video: { Icon: Video, label: 'Video' },
} as const;

export function MediaCard({ item, density }: Props) {
  const { Icon, label } = KIND[item.kind];

  return (
    <article className="card media-card" data-kind={item.kind}>
      {density === 'comfortable' && (
        <div className="card-media">
          {item.image ? (
            <img src={item.image} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="card-media-empty" aria-hidden="true">
              {label}
            </div>
          )}
        </div>
      )}

      <div className="card-body">
        <div className="card-meta">
          <Icon size={15} aria-hidden="true" />
          <span className="sr-only">{label} by </span>
          <span className="card-author">{item.by}</span>
        </div>

        <h2 className="card-title">
          <a className="card-link" href={item.url} data-card-link>
            {item.title}
          </a>
        </h2>
      </div>
    </article>
  );
}
