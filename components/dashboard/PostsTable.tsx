import { useMemo, useState } from 'react';
import { FilePen, TriangleAlert } from 'lucide-react';
import type { ApiError } from '@/lib/api/client';
import { editUrl, type MyArticle } from '@/lib/api/dashboard';
import { formatCount, timeAgo } from '@/lib/format';

type View = 'published' | 'drafts';
type Sort = 'newest' | 'views';

interface Props {
  posts: MyArticle[] | null;
  status: 'loading' | 'ready' | 'error';
  error: ApiError | null;
  onRetry: () => void;
}

export function PostsTable({ posts, status, error, onRetry }: Props) {
  const [view, setView] = useState<View>('published');
  const [sort, setSort] = useState<Sort>('newest');

  const published = useMemo(() => posts?.filter((p) => p.published) ?? [], [posts]);
  const drafts = useMemo(() => posts?.filter((p) => !p.published) ?? [], [posts]);
  const rows = useMemo(() => {
    const list = view === 'published' ? published : drafts;
    return sort === 'views' && view === 'published'
      ? [...list].sort((a, b) => b.page_views_count - a.page_views_count)
      : list;
  }, [view, sort, published, drafts]);

  return (
    <section className="panel posts" aria-labelledby="posts-title">
      <div className="panel-head">
        <h2 id="posts-title">Your posts</h2>
        <div className="posts-controls">
          <div className="segmented" role="radiogroup" aria-label="Which posts">
            <button type="button" role="radio" aria-checked={view === 'published'} className="segment" onClick={() => setView('published')}>
              Published <span className="count">{published.length}</span>
            </button>
            <button type="button" role="radio" aria-checked={view === 'drafts'} className="segment" onClick={() => setView('drafts')}>
              Drafts <span className="count">{drafts.length}</span>
            </button>
          </div>
          {view === 'published' && (
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort posts">
              <option value="newest">Newest</option>
              <option value="views">Most viewed</option>
            </select>
          )}
        </div>
      </div>

      {status === 'error' && error ? (
        <div className="panel-empty" role="alert">
          <TriangleAlert size={16} aria-hidden="true" />
          Couldn't load your posts. {error.message}
          <button type="button" className="banner-action" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : !posts ? (
        <div className="posts-loading" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="dash-sk sk-row" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="panel-empty">{view === 'published' ? 'No published posts yet.' : 'No drafts. Nice and tidy.'}</p>
      ) : (
        <div className="table-wrap">
          <table className="posts-table">
            <thead>
              <tr>
                <th scope="col">Post</th>
                {view === 'published' && (
                  <>
                    <th scope="col" className="num">Views</th>
                    <th scope="col" className="num">Reactions</th>
                    <th scope="col" className="num">Comments</th>
                  </>
                )}
                <th scope="col">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <a className="post-title" href={p.url}>
                      {p.title}
                    </a>
                    {p.published_at && (
                      <time className="post-date" dateTime={p.published_at}>
                        {timeAgo(p.published_at)}
                      </time>
                    )}
                  </td>
                  {view === 'published' && (
                    <>
                      <td className="num">{formatCount(p.page_views_count)}</td>
                      <td className="num">{formatCount(p.public_reactions_count)}</td>
                      <td className="num">{formatCount(p.comments_count)}</td>
                    </>
                  )}
                  <td className="edit-cell">
                    <a className="btn icon-btn" href={editUrl(p)} aria-label={`Edit “${p.title}”`} title="Edit on DEV">
                      <FilePen size={15} aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
