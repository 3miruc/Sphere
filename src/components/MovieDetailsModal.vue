<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" @click="close">
        <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block transform overflow-hidden rounded-lg bg-gray-800 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
        <div class="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            class="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none"
            @click="close"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="media" class="space-y-6">
            <!-- Header -->
            <div class="flex items-start gap-6">
              <img
                :src="posterUrl"
                :alt="mediaTitle"
                class="h-64 w-auto rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-white">{{ mediaTitle }}</h3>
                <p class="mt-2 text-gray-400">
                  {{ releaseYear }} | {{ media.vote_average?.toFixed(1) }}/10
                </p>
                <p class="mt-4 text-gray-300">{{ media.overview }}</p>
                
                <!-- Favorite Button -->
                <button
                  @click="toggleFavorite"
                  class="mt-4 flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 transition-colors"
                >
                  <Bookmark :class="['w-5 h-5', { 'fill-current': isFavorite }]" />
                  {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
                </button>
              </div>
            </div>

            <!-- Trailer -->
            <div v-if="media.trailer" class="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                :src="`https://www.youtube.com/embed/${media.trailer.key}`"
                class="h-full w-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Cast -->
            <div v-if="cast?.length" class="space-y-3">
              <h4 class="text-lg font-semibold text-white">Distribution</h4>
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <div
                  v-for="actor in cast.slice(0, 8)"
                  :key="actor.id"
                  class="overflow-hidden rounded-lg bg-gray-700 p-2"
                >
                  <img
                    v-if="actor.profile_path"
                    :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}`"
                    :alt="actor.name"
                    class="aspect-[2/3] w-full rounded object-cover"
                  />
                  <div v-else class="aspect-[2/3] w-full bg-gray-600 flex items-center justify-center">
                    <User class="h-12 w-12 text-gray-400" />
                  </div>
                  <div class="mt-2">
                    <p class="font-medium text-white">{{ actor.name }}</p>
                    <p class="text-sm text-gray-400">{{ actor.character }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X, User, Bookmark } from 'lucide-vue-next';
import { useMovieStore } from '@/stores/movieStore';
import type { Movie } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  media: Movie | null;
  type: 'movie' | 'tv';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:isOpen', value: boolean): void;
}>();

const movieStore = useMovieStore();

const mediaTitle = computed(() => {
  if (!props.media) return '';
  return props.type === 'movie' ? props.media.title : props.media.name;
});

const releaseYear = computed(() => {
  if (!props.media) return '';
  const date = props.type === 'movie' ? props.media.release_date : props.media.first_air_date;
  return new Date(date).getFullYear();
});

const posterUrl = computed(() => {
  if (!props.media?.poster_path) return '';
  return `https://image.tmdb.org/t/p/w500${props.media.poster_path}`;
});

const cast = computed(() => props.media?.credits?.cast);

const isFavorite = computed(() => {
  if (!props.media) return false;
  return movieStore.isFavorite(props.media.id, props.type);
});

function close() {
  emit('close');
  emit('update:isOpen', false);
}

function toggleFavorite() {
  if (!props.media) return;
  movieStore.toggleFavorite(props.media.id, props.type);
}
</script>