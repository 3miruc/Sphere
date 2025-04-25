import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(true);

  const isAuthenticated = computed(() => !!user.value);

  async function initialize() {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user ?? null;

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null;
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    initialize,
    signUp,
    signIn,
    signOut,
  };
});