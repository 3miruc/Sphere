export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  media_type: 'movie';
  credits?: {
    cast: Cast[];
  };
  watch_providers?: {
    results: {
      FR?: {
        flatrate?: Provider[];
      };
    };
  };
  trailer?: {
    key: string;
    site: string;
    name: string;
  } | null;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  first_air_date: string;
  genre_ids: number[];
  media_type: 'tv';
  credits?: {
    cast: Cast[];
  };
  watch_providers?: {
    results: {
      FR?: {
        flatrate?: Provider[];
      };
    };
  };
  trailer?: {
    key: string;
    site: string;
    name: string;
  } | null;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface UserReview {
  id: string;
  mediaId: number;
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Favorite {
  id: number;
  type: 'movie' | 'tv';
  addedAt: string;
}

export type Media = Movie | TVShow;