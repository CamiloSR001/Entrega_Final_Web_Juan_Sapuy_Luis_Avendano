import React from "react";
import { Link } from "react-router-dom";
import "./NewsCard.css";

const FALLBACK_IMAGE = "/default-news-image.jpg";

const getAuthorLabel = (author) => {
  if (!author) return "Autor desconocido";
  const username = author.username && author.username.trim();
  const email = author.email && author.email.trim();
  if (username && email) return `${username} (${email})`;
  return username || email || "Autor desconocido";
};

const formatDate = (value) => {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleDateString();
};

function NewsCard({ noticia }) {
  const imageUrl = noticia.imageUrl || noticia.image_url || FALLBACK_IMAGE;
  const section = noticia.categoryName || noticia.categories?.name || "General";
  const authorLabel = getAuthorLabel(noticia.author || noticia.profiles);
  const createdAt = noticia.createdAt || noticia.created_at;
  const updatedAt = noticia.updatedAt || noticia.updated_at;
  const displayDate = formatDate(createdAt || updatedAt);
  const excerpt = noticia.content ? noticia.content.slice(0, 140) : noticia.subtitle;

  return (
    <article className="news-card">
      <Link to={`/noticia/${noticia.id}`} className="news-card__link">
        <div className="news-card__image">
          <img
            src={imageUrl}
            alt={noticia.title}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          />
        </div>
        <div className="news-card__content">
          <span className="news-card__section">{section}</span>
          <h3 className="news-card__title">{noticia.title}</h3>
          {noticia.subtitle && <p className="news-card__subtitle">{noticia.subtitle}</p>}

          {excerpt && (
            <div className="news-card__body">
              <span className="news-card__body-label">Resumen</span>
              <p className="news-card__excerpt">{excerpt}{noticia.content && noticia.content.length > 140 ? "…" : ""}</p>
            </div>
          )}

          <div className="news-card__meta">
            <div className="news-card__meta-row">
              <span className="news-card__meta-label">Autor</span>
              <span className="news-card__meta-value" title={authorLabel}>{authorLabel}</span>
            </div>
            <div className="news-card__meta-row">
              <span className="news-card__meta-label">Publicado</span>
              <span className="news-card__meta-value">{displayDate}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default NewsCard;

