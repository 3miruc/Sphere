<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { useUserDataStore } from './stores/userDataStore';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const userDataStore = useUserDataStore();

onMounted(async () => {
  await authStore.initialize();
  if (authStore.isAuthenticated) {
    await userDataStore.loadUserData();
  }
});
</script>