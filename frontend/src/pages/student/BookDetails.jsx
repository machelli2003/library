import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksApi } from "../../services/api/booksApi";
import { borrowApi } from "../../services/api/borrowApi";
import { reservationsApi } from "../../services/api/reservationsApi";
import { reviewsApi } from "../../services/api/reviewsApi";
import { resolveCoverUrl } from "../../utils/imageHelpers";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [message, setMessage] = useState(null);

  // Reviews and ratings states
  const [reviews, setReviews] = useState([]);
  const [eligible, setEligible] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState(null);

  const loadData = () => {
    booksApi
      .get(id)
      .then((res) => {
        setBook(res.data);
        return Promise.all([
          reviewsApi.list(id),
          reviewsApi.checkEligibility(id),
        ]);
      })
      .then(([reviewsRes, eligibilityRes]) => {
        setReviews(reviewsRes.data);
        setEligible(eligibilityRes.data.eligible);
        setEligibilityReason(eligibilityRes.data.reason);
      })
      .catch((err) => console.error("Error loading book details:", err))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [id]);

  const handleBorrowRequest = async () => {
    setActioning(true);
    setMessage(null);
    try {
      await borrowApi.request(book.id);
      setMessage({ type: "success", text: "Borrow request sent! Awaiting librarian approval." });
      loadData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not submit borrow request",
      });
    } finally {
      setActioning(false);
    }
  };

  const handleReserveRequest = async () => {
    setActioning(true);
    setMessage(null);
    try {
      await reservationsApi.create(book.id);
      setMessage({ type: "success", text: "Book successfully reserved! We will notify you when it returns." });
      loadData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not place reservation hold",
      });
    } finally {
      setActioning(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg(null);
    try {
      await reviewsApi.create(book.id, rating, comment);
      setReviewMsg({ type: "success", text: "Thank you! Your review has been posted." });
      setComment("");
      loadData();
    } catch (err) {
      setReviewMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit review",
      });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!book) return <p className="text-slate-500">Book not found.</p>;

  const coverSrc = resolveCoverUrl(book.cover_url);
  const ratingStars = book.average_rating > 0
    ? "★".repeat(Math.round(book.average_rating)) + "☆".repeat(5 - Math.round(book.average_rating))
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>
      </div>

      {/* Main Details Card */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex gap-6">
          {/* Cover image */}
          <div className="flex-shrink-0">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                className="h-40 w-28 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-40 w-28 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                No cover
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-800">{book.title}</h1>
            <p className="mt-1 text-slate-500">{book.author}</p>

            {/* Ratings Header summary */}
            {book.review_count > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-500 font-semibold">
                <span>{ratingStars}</span>
                <span className="text-slate-400 font-medium">
                  {book.average_rating.toFixed(1)} ({book.review_count} {book.review_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-50 px-3 py-1 font-medium border border-slate-100">{book.category || "Uncategorized"}</span>
              {book.isbn && (
                <span className="rounded-full bg-slate-50 px-3 py-1 border border-slate-100">ISBN: {book.isbn}</span>
              )}
            </div>
          </div>
        </div>

        {book.description && (
          <p className="mt-6 text-slate-600 leading-relaxed text-sm">{book.description}</p>
        )}

        {/* Dynamic Borrow / Reserve action panel */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-4">
          <span
            className={book.is_available ? "text-emerald-600 font-semibold text-sm" : "text-red-500 font-semibold text-sm"}
          >
            {book.is_available
              ? `${book.available_copies} of ${book.quantity} copies available`
              : "Out of stock / unavailable"}
          </span>

          {book.is_available ? (
            <button
              onClick={handleBorrowRequest}
              disabled={actioning}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
            >
              {actioning ? "Submitting..." : "Request to Borrow"}
            </button>
          ) : (
            <button
              onClick={handleReserveRequest}
              disabled={actioning}
              className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-40"
            >
              {actioning ? "Reserving..." : "Reserve Book (Place Hold)"}
            </button>
          )}
        </div>

        {message && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Reviews and ratings details section */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3">Reviews & Student Feedback</h2>

        {/* Submit Review Card */}
        {eligible ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-slate-700 text-sm">Write a Review</h4>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500 font-medium">Your Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium block">Comments:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this book..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center justify-between">
              {reviewMsg && (
                <span
                  className={`text-xs font-medium ${
                    reviewMsg.type === "success" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {reviewMsg.text}
                </span>
              )}
              <button
                type="submit"
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-semibold self-end"
              >
                Submit Review
              </button>
            </div>
          </form>
        ) : (
          eligibilityReason && (
            <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3 italic">
              ℹ {eligibilityReason}
            </p>
          )
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6 italic">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b border-slate-50 pb-4 last:border-b-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-700">{r.user_name}</span>
                  <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-amber-500 font-semibold">
                  {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                </div>
                {r.comment && <p className="text-sm text-slate-600 leading-snug">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
