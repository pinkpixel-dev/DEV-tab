import { Clock, Heart, MessageCircle } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import type { Density } from '@/lib/settings';
import { formatCount, timeAgo } from '@/lib/format';

interface Props {
  article: Article;
  density: Density;
  onTagClick: (tag: string) => void;
}

export function ArticleCard({ article, density, onTagClick }: Props) {
  const author = article.organization?.name ?? article.user.name;
  const showMedia = density === 'comfortable';

  return (
    <article className="card">
      {showMedia && (
        <div className="card-media">
          {article.cover_image ? (
            <img src={article.cover_image} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="card-media-empty" aria-hidden="true">
              #{article.tag_list[0] ?? 'dev'}
            </div>
          )}
        </div>
      )}

      <div className="card-body">
        <div className="card-meta">
          <img className="avatar" src={article.user.profile_image_90} alt="" loading="lazy" width={20} height={20} />
          <span className="card-author">{author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.published_at} title={article.readable_publish_date}>
            {timeAgo(article.published_at)}
          </time>
        </div>

        <h2 className="card-title">
          <a className="card-link" href={article.url} data-card-link>
            {article.title}
          </a>
        </h2>

        {showMedia && article.description && <p className="card-desc">{article.description}</p>}

        {article.tag_list.length > 0 && (
          <ul className="card-tags" aria-label="Tags">
            {article.tag_list.slice(0, 4).map((tag) => (
              <li key={tag}>
                <button type="button" className="tag-link" onClick={() => onTagClick(tag)} title={`Show #${tag} posts`}>
                  #{tag}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="card-stats">
          <span title="Reactions">
            <Heart size={14} aria-hidden="true" />
            <span className="sr-only">Reactions: </span>
            {formatCount(article.public_reactions_count)}
          </span>
          <span title="Comments">
            <MessageCircle size={14} aria-hidden="true" />
            <span className="sr-only">Comments: </span>
            {formatCount(article.comments_count)}
          </span>
          <span title="Reading time" className="card-read">
            <Clock size={14} aria-hidden="true" />
            {article.reading_time_minutes} min
          </span>
        </div>
      </div>
    </article>
  );
}

export function CardSkeleton({ density }: { density: Density }) {
  return (
    <div className="card card-skeleton" aria-hidden="true">
      {density === 'comfortable' && <div className="card-media" />}
      <div className="card-body">
        <div className="sk sk-line sk-short" />
        <div className="sk sk-line" />
        <div className="sk sk-line sk-mid" />
      </div>
    </div>
  );
}
