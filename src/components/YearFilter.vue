<template>
  <div class="flex items-center gap-4 mb-8">
    <h3 class="text-lg font-semibold text-white">Année de sortie</h3>
    <select
      v-model="selectedYear"
      class="px-4 py-2 rounded-lg bg-gray-700 text-white border-none focus:ring-2 focus:ring-primary-500"
      @change="$emit('year-change', selectedYear)"
    >
      <option :value="null">Toutes les années</option>
      <option v-for="year in years" :key="year" :value="year">
        {{ year }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  initialYear?: number | null;
}>();

const emit = defineEmits<{
  (e: 'year-change', year: number | null): void;
}>();

const selectedYear = ref(props.initialYear || null);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

onMounted(() => {
  if (props.initialYear) {
    selectedYear.value = props.initialYear;
  }
});
</script>