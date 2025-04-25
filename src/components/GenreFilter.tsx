import React from 'react';
import { Genre } from '../types/tmdb';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenres: number[];
  onGenreToggle: (genreId: number) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({ genres, selectedGenres, onGenreToggle }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">Filtrer par genre</h3>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onGenreToggle(genre.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedGenres.includes(genre.id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};