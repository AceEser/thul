import { useState } from "react";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { api, errorMessage } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

export default function FeedbackForm({ onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const count = words(comment);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please choose a star rating first.");
    if (count > 30) return toast.error("Please keep your comment to 30 words or fewer.");
    setBusy(true);
    try {
      await api.post("/api/feedback", { rating, comment });
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      toast.error(await errorMessage(err));
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="card center" style={{ padding: 32 }}>
        <CheckCircle2 size={44} color="#22c55e" />
        <h3>Thank you for your feedback!</h3>
        <p className="muted">It helps us make THUL better.</p>
      </div>
    );
  }
  return (
    <form className="card feedback-form" onSubmit={submit}>
      <h3>Rate THUL <span className="muted small">(optional)</span></h3>
      <div className="stars" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
            <Star size={34} className={n <= (hover || rating) ? "on" : ""} />
          </button>
        ))}
      </div>
      <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional, max 30 words)" />
      <div className={`small ${count > 30 ? "danger" : "muted"}`}>{count}/30 words</div>
      <button className="btn btn-primary" disabled={busy || count > 30}>
        {busy ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Submit feedback
      </button>
    </form>
  );
}
