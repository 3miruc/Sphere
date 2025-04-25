import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface Favorite {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  created_at: string;
}

interface Review {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  rating: number;
  comment: string;
  created_at: string;
}

export const useUserDataStore = defineStore('userData', () => {
  const authStore = useAuthStore();
  
  const favorites = ref<Favorite[]>([]);
  const reviews = ref<Review[]>([]);
  const isLoading = ref(false);

  // Computed properties for filtered favorites
  const movieFavorites = computed(() => 
    favorites.value.filter(f => f.media_type === 'movie').map(f => f.media_id)
  );

  const tvFavorites = computed(() => 
    favorites.value.filter(f => f.media_type === 'tv').map(f => f.media_id)
  );

  // Load user data
  async function loadUserData() {
    if (!authStore.user) return;

    try {
      isLoading.value = true;
      
      const [favoritesResponse, reviewsResponse] = await Promise.all([
        supabase
          .from('favorites')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })
      ]);

      if (favoritesResponse.error) throw favoritesResponse.error;
      if (reviewsResponse.error) throw reviewsResponse.error;

      favorites.value = favoritesResponse.data;
      reviews.value = reviewsResponse.data;
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  // Favorites management
  async function toggleFavorite(mediaId: number, mediaType: 'movie' | 'tv') {
    if (!authStore.user) return;

    const existing = favorites.value.find(
      f => f.media_id === mediaId && f.media_type === mediaType
    );

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      favorites.value = favorites.value.filter(f => f.id !== existing.id);
    } else {
      // Add favorite
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: authStore.user.id,
          media_id: mediaId,
          media_type: mediaType
        })
        .select()
        .single();

      if (error) throw error;
      favorites.value.unshift(data);
    }
  }

  function isFavorite(mediaId: number, mediaType: 'movie' | 'tv') {
    return favorites.value.some(
      f => f.media_id === mediaId && f.media_type === mediaType
    );
  }

  // Reviews management
  async function addReview(
    mediaId: number,
    mediaType: 'movie' | 'tv',
    rating: number,
    comment: string
  ) {
    if (!authStore.user) return;

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: authStore.user.id,
        media_id: mediaId,
        media_type: mediaType,
        rating,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    reviews.value.unshift(data);
    return data;
  }

  async function updateReview(
    reviewId: string,
    rating: number,
    comment: string
  ) {
    if (!authStore.user) return;

    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    
    const index = reviews.value.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      reviews.value[index] = data;
    }
    
    return data;
  }

  async function deleteReview(reviewId: string) {
    if (!authStore.user) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    reviews.value = reviews.value.filter(r => r.id !== reviewId);
  }

  function getMediaReviews(mediaId: number, mediaType: 'movie' | 'tv') {
    return reviews.value.filter(
      r => r.media_id === mediaId && r.media_type === mediaType
    );
  }

  return {
    favorites,
    reviews,
    isLoading,
    movieFavorites,
    tvFavorites,
    loadUserData,
    toggleFavorite,
    isFavorite,
    addReview,
    updateReview,
    deleteReview,
    getMediaReviews,
  };
});