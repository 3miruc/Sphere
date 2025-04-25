<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Hero Section -->
    <header class="relative h-[70vh] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=2000"
        alt="Cinema background"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50"></div>
      <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">MovieSphere</h1>
          <p class="text-xl mb-6">Découvrez des films et séries qui vous correspondent</p>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <div class="bg-gray-800/95 sticky top-0 z-50 shadow-xl backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un film ou une série..."
              class="w-full px-6 py-3 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              @input="handleSearch"
            />
            <Search class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <RouterLink
            to="/favorites"
            class="px-6 py-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors flex items-center gap-2 text-white"
          >
            <Bookmark class="w-5 h-5" />
            <span class="hidden sm:inline">Favoris</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Filtres -->
      <div class="flex flex-col md:flex-row md:items-start gap-8">
        <div class="w-full md:w-64 space-y-6">
          <YearFilter
            :initial-year="mediaStore.selectedYear"
            @year-change="handleYearChange"
          />
          <GenreFilter
            :genres="mediaStore.genres"
            :selected-genres="mediaStore.selectedGenres"
            @update:selected="updateGenres"
          />
        </div>

        <!-- Contenu -->
        <div class="flex-1">
          <div v-if="mediaStore.isLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          
          <template v-else>
            <!-- Films -->
            <section class="mb-12">
              <h2 class="text-2xl font-bold text-white mb-6">Films Populaires</h2>
              <div v-if="mediaStore.filteredMovies.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MediaCard
                  v-for="movie in mediaStore.filteredMovies"
                  :key="movie.id"
                  :media="movie"
                  type="movie"
                />
              </div>
              <div v-else class="text-center py-12 text-gray-400">
                Aucun film ne correspond aux critères sélectionnés
              </div>
            </section>

            <!-- Séries -->
            <section>
              <h2 class="text-2xl font-bold text-white mb-6">Séries Populaires</h2>
              <div v-if="mediaStore.filteredTVShows.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MediaCard
                  v-for="show in mediaStore.filteredTVShows"
                  :key="show.id"
                  :media="show"
                  type="tv"
                />
              </div>
              <div v-else class="text-center py-12 text-gray-400">
                Aucune série ne correspond aux critères sélectionnés
              </div>
            </section>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Search, Bookmark } from 'lucide-vue-next';
import { useMediaStore } from '@/stores/media';
import MediaCard from '@/components/MediaCard.vue';
import GenreFilter from '@/components/GenreFilter.vue';
import YearFilter from '@/components/YearFilter.vue';

const mediaStore = useMediaStore();
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value) {
    mediaStore.searchContent(searchQuery.value);
  } else {
    mediaStore.fetchTrendingContent();
  }
};

const handleYearChange = (year: number | null) => {
  mediaStore.selectedYear = year;
};

const updateGenres = (genres: number[]) => {
  mediaStore.selectedGenres = genres;
};

onMounted(async () => {
  await Promise.all([
    mediaStore.fetchGenres(),
    mediaStore.fetchTrendingContent()
  ]);
});
</script>