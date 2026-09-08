import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Sparkles, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  Send, 
  Award, 
  Heart,
  Calendar
} from 'lucide-react';
import { api } from '../api/client';
import { Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ReviewsPageProps {
  onOpenBooking: () => void;
  onNavigateToLogin: () => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onOpenBooking, onNavigateToLogin }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [eventType, setEventType] = useState('Royal Wedding Cinematography');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const fetchReviews = () => {
    api.getReviews().then(setReviews).catch(console.error);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to submit your client review.', 'info');
      onNavigateToLogin();
      return;
    }

    if (!comment.trim()) {
      showToast('Please write a brief comment regarding your experience.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitReview({
        rating,
        eventType,
        comment: comment.trim(),
      });

      showToast('Thank you! Your review has been submitted.', 'success');
      setComment('');
      setIsSubmitting(false);
      fetchReviews();
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'Failed to submit review', 'error');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div id="reviews-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Verified Client Testimonials
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Client Experiences & Reviews
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Read firsthand stories from couples, families, car enthusiasts, and academy students who trusted Ashish Wedding Film Studio.
          </p>
        </div>

        {/* Rating Score Banner */}
        <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-5xl font-extrabold font-serif text-white">{averageRating}</span>
              <div className="space-y-0.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-neutral-400 block">{reviews.length} Verified Reviews</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-300 space-y-1 md:border-x border-neutral-800 md:px-6">
            <p className="font-semibold text-white">100% Recommended in Jhumri Telaiya & Jharkhand</p>
            <p className="text-neutral-400">
              Celebrated for crisp 4K drone cinematography, timely album delivery, and dedicated customer support.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
            >
              Book Your Experience
            </button>
          </div>
        </div>

        {/* 2-Column Content: Reviews List + Submit Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Reviews Grid (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Chips */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-semibold mr-2">Filter by:</span>
              <button
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterRating === 'all' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRating(5)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterRating === 5 ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'
                }`}
              >
                <span>5 Stars</span>
                <Star className="w-3 h-3 fill-current" />
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-500">{rev.createdAt}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                      “{rev.comment}”
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-800/80">
                    <img
                      src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}`}
                      alt={rev.userName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
                      <p className="text-[10px] text-amber-400">{rev.eventType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Review Card (1 Col) */}
          <div className="space-y-6">
            <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Share Your Story
                </span>
                <h3 className="text-xl font-bold font-serif text-white">Write a Review</h3>
                <p className="text-xs text-neutral-400">
                  Had an event with Ashish Wedding Film Studio? We’d love your feedback!
                </p>
              </div>

              {!user && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                  <span>Please sign in to write a verified review.</span>
                  <button
                    onClick={onNavigateToLogin}
                    className="block text-amber-400 font-bold mt-1 hover:underline"
                  >
                    Sign In Here →
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Rating Score
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-neutral-700'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-amber-400 font-bold ml-2">({rating} of 5 Stars)</span>
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Event / Service Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Royal Wedding Cinematography">Royal Wedding Cinematography</option>
                    <option value="Pre-Wedding Shoot (Telaiya Dam)">Pre-Wedding Shoot (Telaiya Dam)</option>
                    <option value="New Car / Vehicle Shoot">New Car / Vehicle Shoot</option>
                    <option value="Karizma Velvet Album">Karizma Velvet Album</option>
                    <option value="Music Recording Studio">Music Recording Studio</option>
                    <option value="Academy Media Course">Academy Media Course</option>
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Your Experience
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the video quality, punctuality, drone shots, and studio crew..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Client Review</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
