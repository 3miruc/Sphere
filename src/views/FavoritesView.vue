<template>
  <div class="min-h-screen bg-gray-900">
    <header class="bg-primary-600 text-white py-6 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="text-white hover:text-white/80">
            <ArrowLeft class="w-6 h-6" />
          </RouterLink>
          <h1 class="text-3xl font-bold">Mes favoris</h1>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="favoriteMedia.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <MediaCard
          v-for="media in favoriteMedia"
          :key="media.id"
          :media="media"
          :type="'title' in media ? 'movie' : 'tv'"
        />
      </div>
      <div v-else class="text-center py-12">
        <Bookmark class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-300">Vous n'avez pas encore de favoris</p>
        <RouterLink
          to="/"
          class="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Découvrir des films et séries
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Bookmark, ArrowLeft } from 'lucide-vue-next';
import { useMediaStore } from '@/stores/media';
import MediaCard from '@/components/MediaCard.vue';

const mediaStore = useMediaStore();
const favoriteMedia = computed(() => mediaStore.favoriteMedia);
</script>