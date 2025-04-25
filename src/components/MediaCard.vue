<template>
  <div 
    class="group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300"
    @click="navigateToDetails"
  >
    <div class="relative aspect-[2/3]">
      <img
        :src="posterUrl"
        :alt="mediaTitle"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <p class="text-white text-sm line-clamp-3">{{ media.overview }}</p>
          <div class="flex gap-2 mt-2">
            <button
              @click.stop="toggleFavorite"
              class="px-3 py-1 bg-gray-700 text-white rounded-full text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <Bookmark :class="['w-4 h-4', { 'fill-current': isFavorite }]" />
              {{ isFavorite ? 'Retirer' : 'Favoris' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 bg-gray-800">
      <h3 class="text-lg font-semibold text-white truncate mb-1">{{ mediaTitle }}</h3>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-400">{{ formattedDate }}</span>
        <div class="flex items-center">
          <Star class="w-4 h-4 text-yellow-400 fill-current" />
          <span class="ml-1 text-sm text-gray-300">{{ media.vote_average.toFixed(1) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Star, Bookmark } from 'lucide-vue-next';
import { useMediaStore } from '@/stores/media';
import type { Movie } from '@/types';

const props = defineProps<{
  media: Movie;
  type: 'movie' | 'tv';
}>();

const router = useRouter();
const mediaStore = useMediaStore();

const mediaTitle = computed(() => {
  return props.type === 'movie' ? props.media.title : props.media.name;
});

const posterUrl = computed(() => {
  return props.media.poster_path
    ? `https://image.tmdb.org/t/p/w500${props.media.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';
});

const formattedDate = computed(() => {
  const date = props.type === 'movie' ? props.media.release_date : props.media.first_air_date;
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const isFavorite = computed(() => {
  return mediaStore.isFavorite(props.media.id, props.type);
});

function toggleFavorite() {
  mediaStore.toggleFavorite(props.media.id, props.type);
}

function navigateToDetails() {
  router.push({
    name: 'media-details',
    params: {
      type: props.type,
      id: props.media.id
    }
  });
}
</script>