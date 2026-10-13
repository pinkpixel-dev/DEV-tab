import { forwardRef } from 'react';
import type { Article } from '@/lib/api/types';
import type { Density } from '@/lib/settings';
import { ArticleCard, CardSkeleton } from './ArticleCard';
import './feed.css';

interface Props {
  articles: Article[];
  density: Density;
  loading?: boolean;
  onTagClick: (tag: string) => void;
}

export const FeedGrid = forwardRef<HTMLDivElement, Props>(function FeedGrid(
  { articles, density, loading, onTagClick },
  ref,
) {
  return (
    <div ref={ref} className={`grid grid-${density}`} aria-busy={loading || undefined}>
      {loading
        ? Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} density={density} />)
        : articles.map((a) => <ArticleCard key={a.id} article={a} density={density} onTagClick={onTagClick} />)}
    </div>
  );
});
