export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
  name?: string;
  first_air_date?: string;
  credits?: {
    cast: Cast[];
    crew: Crew[];
  };
  trailer?: {
    key: string;
    site: string;
    name: string;
    iso_639_1: string;
  } | null;
  watchProviders?: {
    flatrate?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
  } | null;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface UserReview {
  id: string;
  userId: string;
  movieId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  year: number | null;
  genres: number[];
  type: 'movie' | 'tv' | 'all';
}