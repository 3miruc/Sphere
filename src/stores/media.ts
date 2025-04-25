import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Media, Genre } from '@/types';

const API_KEY = 'c2521840e0cfff7c88c564de23f7cac4';
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'fr-FR',
  },
});

export const useMediaStore = defineStore('media', () => {
  const movies = ref<Media[]>([]);
  const tvShows = ref<Media[]>([]);
  const genres = ref<Genre[]>([]);
  const selectedGenres = ref<number[]>([]);
  const selectedYear = ref<number | null>(null);
  const searchQuery = ref('');
  const isLoading = ref(false);
  
  // Load favorites from localStorage
  const favorites = ref<{ id: number; type: 'movie' | 'tv' }[]>(
    JSON.parse(localStorage.getItem('favorites') || '[]')
  );

  const filteredMovies = computed(() => {
    let filtered = movies.value;
    
    if (selectedGenres.value.length > 0) {
      filtered = filtered.filter(movie => 
        movie.genre_ids?.some(id => selectedGenres.value.includes(id))
      );
    }

    if (selectedYear.value) {
      filtered = filtered.filter(movie => {
        const year = new Date(movie.release_date).getFullYear();
        return year === selectedYear.value;
      });
    }

    return filtered;
  });

  const filteredTVShows = computed(() => {
    let filtered = tvShows.value;
    
    if (selectedGenres.value.length > 0) {
      filtered = filtered.filter(show => 
        show.genre_ids?.some(id => selectedGenres.value.includes(id))
      );
    }

    if (selectedYear.value) {
      filtered = filtered.filter(show => {
        const year = new Date(show.first_air_date || '').getFullYear();
        return year === selectedYear.value;
      });
    }

    return filtered;
  });

  const favoriteMedia = computed(() => {
    return [...movies.value, ...tvShows.value].filter(media => 
      favorites.value.some(f => f.id === media.id && f.type === ('title' in media ? 'movie' : 'tv'))
    );
  });

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

  async function fetchTrendingContent() {
    try {
      isLoading.value = true;
      
      const [movieResponse, tvResponse] = await Promise.all([
        api.get('/trending/movie/week'),
        api.get('/trending/tv/week')
      ]);

      movies.value = await Promise.all(
        movieResponse.data.results.map(async (movie: Media) => {
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
            genre_ids: movie.genre_ids,
            trailer: trailer || null
          };
        })
      );

      tvShows.value = await Promise.all(
        tvResponse.data.results.map(async (show: Media) => {
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
            genre_ids: show.genre_ids,
            trailer: trailer || null
          };
        })
      );
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function getMediaDetails(id: number, type: 'movie' | 'tv') {
    try {
      const [details, videos, credits] = await Promise.all([
        api.get(`/${type}/${id}`),
        api.get(`/${type}/${id}/videos`),
        api.get(`/${type}/${id}/credits`)
      ]);

      const trailer = videos.data.results.find((video: any) => 
        video.type === 'Trailer' && 
        (video.site === 'YouTube' || video.site === 'Vimeo') &&
        (video.iso_639_1 === 'fr' || video.iso_639_1 === 'en')
      );

      return {
        ...details.data,
        credits: credits.data,
        trailer: trailer || null
      };
    } catch (error) {
      console.error('Error loading media details:', error);
      return null;
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

      movies.value = movieResults.data.results;
      tvShows.value = tvResults.data.results;
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
    favoriteMedia,
    filteredMovies,
    filteredTVShows,
    fetchGenres,
    fetchTrendingContent,
    searchContent,
    getMediaDetails,
    toggleFavorite,
    isFavorite
  };
});