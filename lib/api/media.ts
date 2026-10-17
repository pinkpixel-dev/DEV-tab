import { apiGet } from './client';

// Checked against live dev.to on 2026-10-16. Podcast episodes come newest
// first with no date, description or audio. Videos are posts with an
// embedded video, sorted by hotness. `cloudinary_video_url` is null and the
// duration is "00:00" on the ones checked, so neither is used.
interface PodcastResponse {
  id: number;
  path: string;
  title: string;
  image_url: string | null;
  podcast: { title: string; slug: string; image_url: string | null };
}

interface VideoResponse {
  id: number;
  path: string;
  title: string;
  video: string | null;
  video_source_url: string | null;
  user: { name: string };
}

export interface MediaItem {
  id: number;
  kind: 'podcast' | 'video';
  title: string;
  url: string;
  image: string | null;
  by: string;
}

const PER_PAGE = 30;

export function toPodcast(e: PodcastResponse): MediaItem {
  return {
    id: e.id,
    kind: 'podcast',
    title: e.title.trim(),
    url: `https://dev.to${e.path}`,
    image: e.image_url || e.podcast.image_url || null,
    by: e.podcast.title,
  };
}

// Works for embed, watch and short links.
export function youtubeId(url: string | null): string | null {
  if (!url) return null;
  const m = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  return m?.[1] ?? null;
}

export function toVideo(v: VideoResponse): MediaItem {
  const yt = youtubeId(v.video) ?? youtubeId(v.video_source_url);
  return {
    id: v.id,
    kind: 'video',
    title: v.title.trim(),
    url: `https://dev.to${v.path}`,
    image: yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null,
    by: v.user.name,
  };
}

export async function fetchPodcasts(signal?: AbortSignal): Promise<MediaItem[]> {
  const episodes = await apiGet<PodcastResponse[]>('/podcast_episodes', { per_page: PER_PAGE }, signal);
  return episodes.map(toPodcast);
}

export async function fetchVideos(signal?: AbortSignal): Promise<MediaItem[]> {
  const videos = await apiGet<VideoResponse[]>('/videos', { per_page: PER_PAGE }, signal);
  return videos.map(toVideo);
}
