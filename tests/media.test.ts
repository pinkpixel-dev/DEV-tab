import { describe, expect, it } from 'vitest';
import { toPodcast, toVideo, youtubeId } from '@/lib/api/media';

describe('youtubeId', () => {
  it('reads embed, watch, short and shorts links', () => {
    expect(youtubeId('https://www.youtube.com/embed/7p5LxFdc-Qg')).toBe('7p5LxFdc-Qg');
    expect(youtubeId('https://www.youtube.com/watch?v=7p5LxFdc-Qg&t=30')).toBe('7p5LxFdc-Qg');
    expect(youtubeId('https://www.youtube.com/watch?feature=share&v=7p5LxFdc-Qg')).toBe('7p5LxFdc-Qg');
    expect(youtubeId('https://youtu.be/7p5LxFdc-Qg')).toBe('7p5LxFdc-Qg');
    expect(youtubeId('https://www.youtube.com/shorts/7p5LxFdc-Qg')).toBe('7p5LxFdc-Qg');
  });

  it('returns null for anything else', () => {
    expect(youtubeId('https://player.vimeo.com/video/12345')).toBeNull();
    expect(youtubeId(null)).toBeNull();
  });
});

describe('toVideo', () => {
  // Shape from live /videos on 2026-10-16.
  const raw = {
    id: 4840294,
    path: '/pengeszikra/singularity-news-0010-nhn',
    title: ' Singularity News :: 0010 ',
    video: 'https://www.youtube.com/embed/7p5LxFdc-Qg',
    video_source_url: 'https://www.youtube.com/watch?v=7p5LxFdc-Qg',
    user: { name: 'Peter Vivo' },
  };

  it('links to the post and uses the YouTube thumbnail', () => {
    expect(toVideo(raw)).toEqual({
      id: 4840294,
      kind: 'video',
      title: 'Singularity News :: 0010',
      url: 'https://dev.to/pengeszikra/singularity-news-0010-nhn',
      image: 'https://i.ytimg.com/vi/7p5LxFdc-Qg/hqdefault.jpg',
      by: 'Peter Vivo',
    });
  });

  it('has no image for a video that is not on YouTube', () => {
    expect(toVideo({ ...raw, video: 'https://player.vimeo.com/video/1', video_source_url: null }).image).toBeNull();
  });
});

describe('toPodcast', () => {
  const raw = {
    id: 82680,
    path: '/codenewbie/s27e8-learning-ai-matt-eland',
    title: 'S27:E8 - Learning AI (Matt Eland)',
    image_url: 'https://x/episode.jpg',
    podcast: { title: 'CodeNewbie', slug: 'codenewbie', image_url: 'https://x/show.jpg' },
  };

  it('links to the episode page and names the show', () => {
    expect(toPodcast(raw)).toMatchObject({
      kind: 'podcast',
      url: 'https://dev.to/codenewbie/s27e8-learning-ai-matt-eland',
      image: 'https://x/episode.jpg',
      by: 'CodeNewbie',
    });
  });

  it('falls back to the show art', () => {
    expect(toPodcast({ ...raw, image_url: null }).image).toBe('https://x/show.jpg');
  });
});
