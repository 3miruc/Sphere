<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" @click="close">
        <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block transform overflow-hidden rounded-lg bg-gray-800 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle">
        <div class="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            class="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none"
            @click="close"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <div class="px-6 pt-5 pb-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white mb-4">
              {{ isSignUp ? 'Créer un compte' : 'Connexion' }}
            </h3>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-primary-500 focus:bg-gray-600 focus:ring-0 text-white"
                :disabled="isLoading"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-primary-500 focus:bg-gray-600 focus:ring-0 text-white"
                :disabled="isLoading"
              />
            </div>

            <div v-if="error" class="text-red-400 text-sm">
              {{ error }}
            </div>

            <div>
              <button
                type="submit"
                class="w-full rounded-md bg-primary-600 py-2 px-4 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                :disabled="isLoading"
              >
                <template v-if="isLoading">
                  <span class="flex items-center justify-center">
                    <span class="mr-2">Chargement</span>
                    <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  </span>
                </template>
                <template v-else>
                  {{ isSignUp ? 'Créer un compte' : 'Se connecter' }}
                </template>
              </button>
            </div>

            <div class="text-center text-sm">
              <button
                type="button"
                class="text-primary-400 hover:text-primary-300"
                @click="toggleMode"
                :disabled="isLoading"
              >
                {{ isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useUserDataStore } from '@/stores/userDataStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:isOpen', value: boolean): void;
}>();

const authStore = useAuthStore();
const userDataStore = useUserDataStore();

const isSignUp = ref(false);
const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const close = () => {
  emit('close');
  emit('update:isOpen', false);
  resetForm();
};

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
  error.value = '';
};

const resetForm = () => {
  email.value = '';
  password.value = '';
  error.value = '';
  isLoading.value = false;
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    if (isSignUp.value) {
      await authStore.signUp(email.value, password.value);
    } else {
      await authStore.signIn(email.value, password.value);
    }

    if (authStore.isAuthenticated) {
      await userDataStore.loadUserData();
      close();
    }
  } catch (err: any) {
    error.value = err.message || 'Une erreur est survenue';
  } finally {
    isLoading.value = false;
  }
};
</script>