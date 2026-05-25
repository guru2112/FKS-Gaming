import { useEffect, useState } from "react";
import { api } from "@/lib/auth";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`h-4 w-4 ${index < rating ? "text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.45)]" : "text-white/20"}`}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ review }: { review: any }) => {
  const initial = review.name?.charAt(0)?.toUpperCase() || "G";

  return (
    <article className="group relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 active:-translate-y-2 hover:border-[#ff6b35]/50 hover:bg-white/[0.07] hover:shadow-[0_22px_80px_rgba(255,107,53,0.16)] sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#ff6b35]/20 blur-3xl transition-opacity duration-300 group-hover:opacity-90" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ff6b35]/40 bg-gradient-to-br from-[#ff6b35] to-[#ff9f1c] text-base font-black text-white shadow-[0_0_25px_rgba(255,107,53,0.35)]">
              {initial}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-white sm:text-base">
                {review.name}
              </h3>
              {review.date && (
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
                  {review.date}
                </p>
              )}
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff6b35]">
            Google
          </span>
        </div>

        <StarRating rating={review.rating} />

        <p className="mt-5 flex-1 text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
          “{review.comment}”
        </p>
      </div>
    </article>
  );
};

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await api.get<{ success: boolean; data: any[] }>("/api/reviews");
        if (data && data.success && data.data) {
          const validReviews = data.data.filter((r: any) => r.comment && r.comment.trim() !== "");
          setReviews(validReviews as any);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#050505] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/70 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#ff6b35]">
            Player Reviews
          </p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            What Gamers Say About Us
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-400 sm:text-base">
            Real experiences from our gaming community
          </p>
        </div>

        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pt-4 pb-8 -mx-4">
          {loading ? (
            <div className="w-full flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff6b35] border-t-transparent"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="flex gap-5 lg:gap-6 w-max px-4 animate-scroll-mobile hover:[animation-play-state:paused]">
              {[...reviews, ...reviews].map((review: any, idx) => (
                <div key={`review-${idx}`} className="w-[300px] sm:w-[360px] shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-10 text-center text-white/50 font-medium">
              No reviews available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
