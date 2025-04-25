<template>
  <div class="mb-8">
    <h3 class="text-lg font-semibold mb-3 text-white">Filtrer par genre</h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="genre in genres"
        :key="genre.id"
        @click="toggleGenre(genre.id)"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedGenres.includes(genre.id)
            ? 'bg-primary-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"
      >
        {{ genre.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Genre } from '@/types';

const props = defineProps<{
  genres: Genre[];
  selectedGenres: number[];
}>();

const emit = defineEmits<{
  (e: 'update:selected', value: number[]): void;
}>();

const toggleGenre = (genreId: number) => {
  const selected = [...props.selectedGenres];
  const index = selected.indexOf(genreId);
  
  if (index === -1) {
    selected.push(genreId);
  } else {
    selected.splice(index, 1);
  }
  
  emit('update:selected', selected);
};
</script>