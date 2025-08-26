import type { TmdbMovie } from "./TmdbMovie";

export type CarouselContextValue = {
  items: TmdbMovie[];
  loading: boolean;
  error: string | null;

  pageIndex: number;
  isFetchingMore: boolean;
  canPrev: boolean;
  canNext: boolean;
  visible: TmdbMovie[];

  prev: () => void;
  next: () => Promise<void> | void;
};