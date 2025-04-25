import React, { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Movie, TVShow, UserReview } from '../types/tmdb';

interface MediaCardProps {
  media: Movie | TVShow;
  genres: { [key: number]: string };
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, genres }) => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<UserReview[]>([]);

  const title = 'title' in media ? media.title : media.name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: UserReview = {
      rating: userRating,
      comment,
      date: new Date().toISOString(),
    };
    setReviews([newReview, ...reviews]);
    setComment('');
    setUserRating(0);
    setIsReviewOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <img
        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
        alt={title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 truncate">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{new Date(releaseDate).getFullYear()}</p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {media.genre_ids.map((genreId) => (
            <span key={genreId} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {genres[genreId]}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1">{media.vote_average.toFixed(1)}</span>
          </div>
          <button
            onClick={() => setIsReviewOpen(!isReviewOpen)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Avis</span>
          </button>
        </div>

        {isReviewOpen && (
          <div className="mt-4 border-t pt-4">
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer ${
                        star <= userRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                      onClick={() => setUserRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Commentaire</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Publier
              </button>
            </form>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-4 border-t pt-4">
            {reviews.map((review, index) => (
              <div key={index} className="mb-3 last:mb-0">
                <div className="flex items-center mb-1">
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};