import axios from 'axios';
import { Movie, TVShow, Genre } from '../types/tmdb';

const API_KEY = 'c2521840e0cfff7c88c564de23f7cac4';
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'fr-FR',
  },
});

export const getTrendingMovies = async (): Promise<Movie[]> => {
  const response = await api.get('/trending/movie/week');
  return response.data.results;
};

export const getTrendingTVShows = async (): Promise<TVShow[]> => {
  const response = await api.get('/trending/tv/week');
  return response.data.results;
};

export const searchMedia = async (query: string): Promise<(Movie | TVShow)[]> => {
  const response = await api.get('/search/multi', {
    params: { query },
  });
  return response.data.results;
};

export const getGenres = async (): Promise<Genre[]> => {
  const [movieGenres, tvGenres] = await Promise.all([
    api.get('/genre/movie/list'),
    api.get('/genre/tv/list')
  ]);
  
  const uniqueGenres = new Map();
  [...movieGenres.data.genres, ...tvGenres.data.genres].forEach((genre: Genre) => {
    uniqueGenres.set(genre.id, genre);
  });
  
  return Array.from(uniqueGenres.values());
};