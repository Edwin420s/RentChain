import React, { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Flag } from 'lucide-react'

const ReviewSystem = ({ reviews, onAddReview, userRole }) => {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    type: userRole // 'tenant' or 'landlord'
  })

  const handleSubmitReview = (e) => {
    e.preventDefault()
    onAddReview(newReview)
    setNewReview({ rating: 5, title: '', comment: '', type: userRole })
    setShowReviewForm(false)
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Reviews & Ratings</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-text">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} readonly />
            </div>
            <div className="text-sm text-gray-600">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Write Review
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-text mb-4">Write a Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Rating
              </label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Detailed Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                placeholder="Share details of your experience with this property..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-secondary text-text px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {review.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-text">{review.author}</div>
                  <div className="text-sm text-gray-600 capitalize">{review.type}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <StarRating rating={review.rating} readonly />
                <span className="text-sm text-gray-600 ml-2">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h5 className="font-semibold text-text mb-2">{review.title}</h5>
            <p className="text-gray-700 mb-4">{review.comment}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                <ThumbsDown className="h-4 w-4" />
                <span>Not Helpful ({review.notHelpful})</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-error transition-colors">
                <Flag className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No reviews yet</div>
            <div className="text-sm text-gray-600">
              Be the first to share your experience with this property
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewSystem