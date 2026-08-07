"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import type { Review } from "@/lib/types";
import { Star, Loader2, MessageSquare, Trash2, PenSquare } from "lucide-react";

interface ReviewsSectionProps {
  profileId: string;
  profileName: string;
}

export function ReviewsSection({ profileId, profileName }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
        setUserEmail(session?.user?.email ?? null);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError("Debes iniciar sesión para dejar una reseña");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      profile_id: profileId,
      user_id: userId,
      rating,
      comment: comment || null,
      author_name: authorName || userEmail || "Anónimo",
    };

    let result;
    if (editingReview) {
      result = await supabase
        .from("reviews")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", editingReview.id);
    } else {
      result = await supabase.from("reviews").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
    } else {
      setShowForm(false);
      setEditingReview(null);
      setComment("");
      setAuthorName("");
      setRating(5);
      setSaving(false);
      fetchReviews();
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("¿Eliminar tu reseña?")) return;
    await supabase.from("reviews").delete().eq("id", reviewId);
    fetchReviews();
  }

  function startEdit(review: Review) {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment ?? "");
    setAuthorName(review.author_name ?? "");
    setShowForm(true);
  }

  function startCreate() {
    setEditingReview(null);
    setRating(5);
    setComment("");
    setAuthorName("");
    setShowForm(true);
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const userReview = reviews.find((r) => r.user_id === userId);

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <MessageSquare size={20} />
          Reseñas
          {avgRating && (
            <span className="flex items-center gap-1 text-base font-normal text-muted-foreground">
              <Star size={14} fill="currentColor" className="text-yellow-400" />
              {avgRating} ({reviews.length})
            </span>
          )}
        </h2>
        {userId && !userReview && !showForm && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <PenSquare size={14} />
            Escribir reseña
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-xl border bg-card p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Calificación</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={24}
                    fill={star <= rating ? "currentColor" : "none"}
                    className={
                      star <= rating
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Nombre (opcional)</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tu nombre o anónimo"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder={`Cuéntanos sobre tu experiencia con ${profileName}...`}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingReview ? "Actualizar" : "Publicar reseña"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Aún no hay reseñas para {profileName}.
          {userId
            ? " ¡Sé el primero en escribir una!"
            : " Inicia sesión para escribir una reseña."}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={star <= review.rating ? "currentColor" : "none"}
                        className={
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {review.author_name ?? "Anónimo"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.user_id === userId && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(review)}
                      className="rounded p-1 hover:bg-muted"
                      title="Editar"
                    >
                      <PenSquare size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
