import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MediaCard } from './components/MediaCard';
import { GenreFilter } from './components/GenreFilter';
import { getTrendingMovies, getTrendingTVShows, searchMedia, getGenres } from './services/tmdb';
import { Movie, TVShow, Genre } from './types/tmdb';

function App() {
  const [trending, setTrending] = useState<(Movie | TVShow)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [genreMap, setGenreMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [movies, shows, genreList] = await Promise.all([
          getTrendingMovies(),
          getTrendingTVShows(),
          getGenres()
        ]);
        
        setTrending([...movies, ...shows].sort(() => Math.random() - 0.5).slice(0, 12));
        setGenres(genreList);
        
        const genreMapping: { [key: number]: string } = {};
        genreList.forEach(genre => {
          genreMapping[genre.id] = genre.name;
        });
        setGenreMap(genreMapping);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery) {
        try {
          const results = await searchMedia(searchQuery);
          setSearchResults(results.filter(item => item.poster_path));
        } catch (error) {
          console.error('Erreur lors de la recherche:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const filterByGenres = (media: Movie | TVShow) => {
    if (selectedGenres.length === 0) return true;
    return selectedGenres.some(genreId => media.genre_ids.includes(genreId));
  };

  const displayedMedia = searchQuery ? searchResults : trending;
  const filteredMedia = displayedMedia.filter(filterByGenres);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Movie Sphere</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un film ou une série..."
              className="w-full px-4 py-2 rounded-lg text-gray-900 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <GenreFilter
              genres={genres}
              selectedGenres={selectedGenres}
              onGenreToggle={handleGenreToggle}
            />
            
            <h2 className="text-2xl font-semibold mb-6">
              {searchQuery ? 'Résultats de recherche' : 'Tendances de la semaine'}
            </h2>
            
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMedia.map((media) => (
                  <MediaCard key={media.id} media={media} genres={genreMap} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                Aucun résultat ne correspond à vos critères de recherche.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
