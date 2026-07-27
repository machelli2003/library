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

  if (loading) return <LoadingSpinner label="Loading book details..." />;
  if (!book) return <p className="text-slate-500 font-semibold text-center py-12">Book not found.</p>;

  const coverSrc = resolveCoverUrl(book.cover_url);
  const ratingStars = book.average_rating > 0
    ? "★".repeat(Math.round(book.average_rating)) + "☆".repeat(5 - Math.round(book.average_rating))
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back Button Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Main Details Card */}
      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
          {/* Cover image wrapper */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                className="h-56 w-40 rounded-xl object-cover shadow-md shadow-slate-200/60 border border-slate-100"
              />
            ) : (
              <div className="flex h-56 w-40 flex-col items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 gap-2">
                <svg className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">No Cover URL</span>
              </div>
            )}
          </div>

          {/* Details Content columns */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full bg-indigo-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo border border-indigo/5 mb-3">
                {book.category || "General Catalogue"}
              </span>
              
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink leading-tight">
                {book.title}
              </h1>
              
              <p className="mt-1 text-base text-slate-500 font-medium">{book.author}</p>

              {/* Ratings summary banner */}
              {book.review_count > 0 ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-500 font-bold">
                  <span className="tracking-wide text-lg">{ratingStars}</span>
                  <span className="text-slate-400 font-semibold text-xs mt-0.5">
                    {book.average_rating.toFixed(1)} ({book.review_count} {book.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-400 font-semibold italic">
                  No ratings recorded yet
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400 font-semibold">
              {book.isbn && (
                <span className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-1.5 font-mono">
                  ISBN: {book.isbn}
                </span>
              )}
              <span className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-1.5">
                Total copies: {book.quantity}
              </span>
            </div>
          </div>
        </div>

        {book.description && (
          <div className="border-t border-slate-50 pt-6">
            <h3 className="font-display text-base font-bold text-ink mb-2">Book Description</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{book.description}</p>
          </div>
        )}

        {/* Action Panel Alert */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl bg-slate-50 border border-slate-100 p-5 gap-4">
          <div className="flex items-center gap-3">
            <span className={`flex h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
              book.is_available 
                ? "bg-emerald-100 border-emerald-500 animate-pulse" 
                : "bg-red-100 border-red-500"
            }`} />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {book.is_available ? "Available to Borrow" : "Currently Out of Stock"}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {book.is_available 
                  ? `${book.available_copies} of ${book.quantity} copies in circulation` 
                  : "All copies currently checked out by other students"}
              </p>
            </div>
          </div>

          {book.is_available ? (
            <button
              onClick={handleBorrowRequest}
              disabled={actioning}
              className="rounded-xl bg-ink px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-indigo hover:shadow-indigo/15 disabled:opacity-40"
            >
              {actioning ? "Submitting..." : "Request to Borrow"}
            </button>
          ) : (
            <button
              onClick={handleReserveRequest}
              disabled={actioning}
              className="rounded-xl bg-amber px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-amber/90 hover:shadow-amber/15 disabled:opacity-40"
            >
              {actioning ? "Reserving..." : "Reserve Book / Hold"}
            </button>
          )}
        </div>

        {message && (
          <div
            className={`rounded-xl border p-4 flex gap-3 text-sm font-medium ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {message.type === "success" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
            <p>{message.text}</p>
          </div>
        )}
      </div>

      {/* Reviews and ratings details section */}
      <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink border-b border-slate-50 pb-4">
          Student Feedback & Reviews
        </h2>

        {/* Submit Review Card */}
        {eligible ? (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-700">Write a Book Review</h4>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm"
              >
                <option value={5}>5 Stars — Excellent</option>
                <option value={4}>4 Stars — Very Good</option>
                <option value={3}>3 Stars — Average</option>
                <option value={2}>2 Stars — Fair</option>
                <option value={1}>1 Star — Poor</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Review Description:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your reading thoughts or course alignment on this textbook..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm transition focus:outline-none focus:ring-1 focus:ring-indigo shadow-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              {reviewMsg && (
                <span
                  className={`text-xs font-semibold ${
                    reviewMsg.type === "success" ? "text-emerald" : "text-crimson"
                  }`}
                >
                  {reviewMsg.text}
                </span>
              )}
              <button
                type="submit"
                className="rounded-xl bg-ink hover:bg-indigo text-white px-5 py-2 text-xs font-bold uppercase tracking-wider self-end sm:self-auto transition shadow-sm"
              >
                Submit Review
              </button>
            </div>
          </form>
        ) : (
          eligibilityReason && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-400 font-medium flex gap-2.5 items-center">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{eligibilityReason}</span>
            </div>
          )
        )}

        {/* Reviews List */}
        <div className="space-y-4 pt-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 italic">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((r) => {
                const userLetter = r.user_name ? r.user_name[0].toUpperCase() : "U";
                return (
                  <div key={r.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 border border-slate-200">
                          {userLetter}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-slate-700 block">{r.user_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-amber-500 font-bold tracking-wider">
                        {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed pl-12">{r.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
