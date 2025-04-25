import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Movie } from '@/types';

const TMDB_API_KEY = 'c2521840e0cfff7c88c564de23f7cac4';
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'fr-FR'
  }
});

export const useMovieStore = defineStore('movie', () => {
  // State
  const movies = ref<Movie[]>([]);
  const tvShows = ref<Movie[]>([]);
  const genres = ref<Genre[]>([]);
  const selectedGenres = ref<number[]>([]);
  const selectedYear = ref<number | null>(null);
  const searchQuery = ref('');
  const isLoading = ref(false);
  
  // Load favorites from localStorage
  const favorites = ref<{ id: number; type: 'movie' | 'tv' }[]>(
    JSON.parse(localStorage.getItem('favorites') || '[]')
  );

  // Computed properties
  const favoriteMovies = computed(() => {
    return movies.value.filter(movie => 
      favorites.value.some(f => f.id === movie.id && f.type === 'movie')
    );
  });

  const favoriteTVShows = computed(() => {
    return tvShows.value.filter(show => 
      favorites.value.some(f => f.id === show.id && f.type === 'tv')
    );
  });

  // Actions
  async function fetchTrendingContent() {
    try {
      isLoading.value = true;
      
      const [movieResponse, tvResponse] = await Promise.all([
        api.get('/trending/movie/week'),
        api.get('/trending/tv/week')
      ]);

      // Fetch additional details including trailers
      const movieDetails = await Promise.all(
        movieResponse.data.results.map(async (movie: Movie) => {
          const [details, videos] = await Promise.all([
            api.get(`/movie/${movie.id}`),
            api.get(`/movie/${movie.id}/videos`)
          ]);

          const trailer = videos.data.results.find((video: any) => 
            video.type === 'Trailer' && 
            (video.site === 'YouTube' || video.site === 'Vimeo') &&
            (video.iso_639_1 === 'fr' || video.iso_639_1 === 'en')
          );

          return {
            ...details.data,
            trailer: trailer || null
          };
        })
      );

      const tvDetails = await Promise.all(
        tvResponse.data.results.map(async (show: Movie) => {
          const [details, videos] = await Promise.all([
            api.get(`/tv/${show.id}`),
            api.get(`/tv/${show.id}/videos`)
          ]);

          const trailer = videos.data.results.find((video: any) => 
            video.type === 'Trailer' && 
            (video.site === 'YouTube' || video.site === 'Vimeo') &&
            (video.iso_639_1 === 'fr' || video.iso_639_1 === 'en')
          );

          return {
            ...details.data,
            trailer: trailer || null
          };
        })
      );

      movies.value = movieDetails.slice(0, 8);
      tvShows.value = tvDetails.slice(0, 8);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchGenres() {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        api.get('/genre/movie/list'),
        api.get('/genre/tv/list')
      ]);
      
      const uniqueGenres = new Map();
      [...movieGenres.data.genres, ...tvGenres.data.genres].forEach((genre: Genre) => {
        uniqueGenres.set(genre.id, genre);
      });
      
      genres.value = Array.from(uniqueGenres.values());
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  }

  async function searchContent(query: string) {
    if (!query.trim()) {
      movies.value = [];
      tvShows.value = [];
      return;
    }

    try {
      isLoading.value = true;
      
      const [movieResults, tvResults] = await Promise.all([
        api.get('/search/movie', { params: { query } }),
        api.get('/search/tv', { params: { query } })
      ]);

      // Fetch trailers for search results
      const movieDetails = await Promise.all(
        movieResults.data.results.map(async (movie: Movie) => {
          const videos = await api.get(`/movie/${movie.id}/videos`);
          const trailer = videos.data.results.find((video: any) => 
            video.type === 'Trailer' && 
            (video.site === 'YouTube' || video.site === 'Vimeo')
          );
          return { ...movie, trailer: trailer || null };
        })
      );

      const tvDetails = await Promise.all(
        tvResults.data.results.map(async (show: Movie) => {
          const videos = await api.get(`/tv/${show.id}/videos`);
          const trailer = videos.data.results.find((video: any) => 
            video.type === 'Trailer' && 
            (video.site === 'YouTube' || video.site === 'Vimeo')
          );
          return { ...show, trailer: trailer || null };
        })
      );

      movies.value = movieDetails;
      tvShows.value = tvDetails;
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function toggleFavorite(id: number, type: 'movie' | 'tv') {
    const index = favorites.value.findIndex(f => f.id === id && f.type === type);
    
    if (index === -1) {
      favorites.value.push({ id, type });
    } else {
      favorites.value.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites.value));
  }

  function isFavorite(id: number, type: 'movie' | 'tv') {
    return favorites.value.some(f => f.id === id && f.type === type);
  }

  return {
    movies,
    tvShows,
    genres,
    selectedGenres,
    selectedYear,
    searchQuery,
    isLoading,
    favorites,
    favoriteMovies,
    favoriteTVShows,
    fetchTrendingContent,
    fetchGenres,
    searchContent,
    toggleFavorite,
    isFavorite
  };
});