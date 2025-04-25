<template>
  <div v-if="media" class="min-h-screen bg-gray-900">
    <!-- Hero Section -->
    <div 
      class="h-[50vh] bg-cover bg-center relative"
      :style="`background-image: url(https://image.tmdb.org/t/p/original${media.backdrop_path})`"
    >
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center gap-4">
            <RouterLink 
              to="/" 
              class="text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft class="w-6 h-6" />
            </RouterLink>
            <h1 class="text-4xl font-bold">
              {{ mediaTitle }}
            </h1>
            <button
              @click="toggleFavorite"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
              :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            >
              <Bookmark
                :class="[
                  'w-6 h-6',
                  isFavorite ? 'fill-current' : ''
                ]"
              />
            </button>
          </div>
          <p class="text-lg opacity-90 mt-2">{{ releaseDate }}</p>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="md:col-span-2">
          <section v-if="media.overview" class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-white">Synopsis</h2>
            <p class="text-gray-300">{{ media.overview }}</p>
          </section>

          <!-- Bande-annonce -->
          <section v-if="media.trailer" class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-white">Bande-annonce</h2>
            <div class="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                v-if="media.trailer.site === 'YouTube'"
                :src="`https://www.youtube.com/embed/${media.trailer.key}`"
                class="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </section>

          <!-- Distribution -->
          <section v-if="mainCast.length > 0" class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-white">Distribution principale</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                v-for="actor in mainCast"
                :key="actor.id"
                class="bg-gray-800 rounded-lg p-4"
              >
                <img
                  v-if="actor.profile_path"
                  :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
                  :alt="actor.name"
                  class="w-full h-40 object-cover rounded-lg mb-2"
                />
                <div v-else class="w-full h-40 bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                  <User class="w-12 h-12 text-gray-500" />
                </div>
                <h3 class="font-semibold text-white">{{ actor.name }}</h3>
                <p class="text-sm text-gray-400">{{ actor.character }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside>
          <img
            :src="`https://image.tmdb.org/t/p/w500${media.poster_path}`"
            :alt="mediaTitle"
            class="w-full rounded-lg shadow-lg"
          />
          
          <!-- Statistiques -->
          <div class="mt-4 bg-gray-800 rounded-lg p-4">
            <div class="flex items-center mb-4">
              <Star class="w-6 h-6 text-yellow-400 fill-current" />
              <span class="text-xl font-semibold ml-2 text-white">
                {{ media.vote_average.toFixed(1) }}/10
              </span>
            </div>
          </div>

          <!-- Plateformes de streaming -->
          <div v-if="streamingProviders.length > 0" class="mt-4 bg-gray-800 rounded-lg p-4">
            <h3 class="font-semibold mb-3 text-white">Disponible sur</h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="provider in streamingProviders"
                :key="provider.provider_id"
                class="flex items-center gap-2 p-2 bg-gray-700 rounded"
              >
                <img
                  :src="`https://image.tmdb.org/t/p/original${provider.logo_path}`"
                  :alt="provider.provider_name"
                  class="w-8 h-8 rounded"
                />
                <span class="text-sm text-gray-300">{{ provider.provider_name }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { Star, Bookmark, User, ArrowLeft } from 'lucide-vue-next';
import { useMediaStore } from '@/stores/media';
import type { Media } from '@/types/tmdb';

const route = useRoute();
const mediaStore = useMediaStore();
const media = ref<Media | null>(null);

const mediaTitle = computed(() => {
  if (!media.value) return '';
  return 'title' in media.value ? media.value.title : media.value.name;
});

const releaseDate = computed(() => {
  if (!media.value) return '';
  const date = 'release_date' in media.value ? media.value.release_date : media.value.first_air_date;
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const mainCast = computed(() => {
  if (!media.value?.credits?.cast) return [];
  return media.value.credits.cast.slice(0, 6);
});

const streamingProviders = computed(() => {
  if (!media.value?.watch_providers?.results?.FR?.flatrate) return [];
  return media.value.watch_providers.results.FR.flatrate;
});

const isFavorite = computed(() => {
  if (!media.value) return false;
  return mediaStore.isFavorite(
    media.value.id,
    'title' in media.value ? 'movie' : 'tv'
  );
});

function toggleFavorite() {
  if (!media.value) return;
  mediaStore.toggleFavorite(
    media.value.id,
    'title' in media.value ? 'movie' : 'tv'
  );
}

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    const type = route.params.type as 'movie' | 'tv';
    
    if (isNaN(id) || !['movie', 'tv'].includes(type)) {
      throw new Error('Invalid route parameters');
    }

    const details = await mediaStore.getMediaDetails(id, type);
    if (details) {
      media.value = details;
    }
  } catch (error) {
    console.error('Error loading media details:', error);
  }
});
</script>