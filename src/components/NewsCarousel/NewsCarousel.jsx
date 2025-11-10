import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./NewsCarousel.css";

const FALLBACK_IMAGE = "/default-news-image.jpg";
const TILE_ROWS = 3;
const TILE_COLS = 5;
const TILE_TOTAL = TILE_ROWS * TILE_COLS;
const ANIMATION_DURATION = 750;

function NewsCarousel({ items = [], autoPlay = true, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevImage, setPrevImage] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const slides = useMemo(() => items.filter(Boolean), [items]);
  const animationTimeout = useRef();

  const goTo = (index) => {
    if (slides.length === 0 || isAnimating) return;
    const nextIndex = (index + slides.length) % slides.length;
    if (nextIndex === currentIndex) return;

    const currentImageUrl =
      slides[currentIndex]?.imageUrl || slides[currentIndex]?.image_url || FALLBACK_IMAGE;
    setPrevImage(currentImageUrl);
    setIsAnimating(true);
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    if (!isAnimating) return undefined;
    clearTimeout(animationTimeout.current);
    animationTimeout.current = setTimeout(() => {
      setIsAnimating(false);
      setPrevImage(null);
    }, ANIMATION_DURATION);

    return () => clearTimeout(animationTimeout.current);
  }, [isAnimating]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return undefined;

    const id = setInterval(() => {
      if (!isAnimating) {
        goTo(currentIndex + 1);
      }
    }, interval);

    return () => clearInterval(id);
  }, [autoPlay, currentIndex, interval, slides.length, isAnimating]);

  if (slides.length === 0) {
    return (
      <div className="news-carousel news-carousel--empty">
        <p>No hay noticias publicadas todavía.</p>
      </div>
    );
  }

  const active = slides[currentIndex];
  const imageUrl = active.imageUrl || active.image_url || FALLBACK_IMAGE;
  const author = active.author || active.profiles;
  const username = author?.username?.trim();
  const email = author?.email?.trim();
  const authorLabel = username && email ? `${username} (${email})` : username || email || "Autor desconocido";
  const categoryLabel = active.categoryName || active.categories?.name || "General";
  const dateSource =
    active.createdAt ||
    active.updatedAt ||
    active.created_at ||
    active.updated_at ||
    Date.now();
  const publishedDate = new Date(dateSource);
  const formattedDate = Number.isNaN(publishedDate.getTime())
    ? "Fecha no disponible"
    : publishedDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="news-carousel">
      {/* columna izquierda con imagen adaptada al espacio */}
      <div className="news-carousel__image" key={active.id}>
        <img
          className="news-carousel__base-image"
          src={imageUrl}
          alt={active.title}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
        />

        {isAnimating && prevImage && (
          <div className="news-carousel__transition" style={{ "--rows": TILE_ROWS, "--cols": TILE_COLS }}>
            {Array.from({ length: TILE_TOTAL }).map((_, idx) => {
              const row = Math.floor(idx / TILE_COLS);
              const col = idx % TILE_COLS;
              const colPercent = TILE_COLS === 1 ? 0 : (col / (TILE_COLS - 1)) * 100;
              const rowPercent = TILE_ROWS === 1 ? 0 : (row / (TILE_ROWS - 1)) * 100;

              return (
                <div
                  key={`tile-${idx}`}
                  className="news-carousel__transition-tile"
                  style={{
                    "--delay": row + col,
                    backgroundImage: `url(${prevImage})`,
                    backgroundPosition: `${colPercent}% ${rowPercent}%`,
                    backgroundSize: `${TILE_COLS * 100}% ${TILE_ROWS * 100}%`,
                  }}
                />
              );
            })}
          </div>
        )}

        <span className="news-carousel__badge">{categoryLabel}</span>
      </div>

      <div className="news-carousel__content" key={`${active.id}-content`}>
        {/* meta agrupada para que titulo y autor queden ordenados */}
        <div className="news-carousel__meta">
          <div className="news-carousel__meta-item">
            <span className="news-carousel__meta-label">Autor</span>
            <p className="news-carousel__meta-value">{authorLabel}</p>
          </div>
          <div className="news-carousel__meta-item">
            <span className="news-carousel__meta-label">Publicado</span>
            <p className="news-carousel__meta-value">{formattedDate}</p>
          </div>
          <div className="news-carousel__meta-item">
            <span className="news-carousel__meta-label">Sección</span>
            <p className="news-carousel__meta-value">{categoryLabel}</p>
          </div>
        </div>

        <h2 className="news-carousel__title">{active.title}</h2>

        <div className="news-carousel__body">
          <Link to={`/noticia/${active.id}`} className="news-carousel__cta">
            Leer noticia completa
          </Link>
        </div>

        <div className="news-carousel__controls">
          {/* botones para ir atras, puntos para saltar y avanzar sin perder el estilo */}
          <button type="button" onClick={() => goTo(currentIndex - 1)}>
            ⟨ Anterior
          </button>
          <div className="news-carousel__dots">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                className={idx === currentIndex ? "dot dot--active" : "dot"}
                onClick={() => goTo(idx)}
                aria-label={`Ir a la noticia ${idx + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => goTo(currentIndex + 1)}>
            Siguiente ⟩
          </button>
        </div>
      </div>
    </section>
  );
}

export default NewsCarousel;

