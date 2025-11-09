import React, { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firebaseDb } from "../../firebase";
import NewsCarousel from "../../components/NewsCarousel/NewsCarousel";
import NewsCard from "../../components/NewsCard/NewsCard";
import { mapNewsDoc } from "../../utils/newsMapping";
import "./Home.css";

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newsRef = collection(firebaseDb, "news");
    const publishedNewsQuery = query(
      newsRef,
      where("status", "==", "Publicado"),
      orderBy("createdAt", "desc"),
      limit(12)
    );

    const unsubscribe = onSnapshot(
      publishedNewsQuery,
      (snapshot) => {
        const items = snapshot.docs.map(mapNewsDoc);
        setNews(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar noticias:", error);
        setNews([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const featuredNews = news.slice(0, 5);

  const newsBySection = news.reduce((acc, item) => {
    const key = item.categoryName || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sections = Object.entries(newsBySection).sort((a, b) => a[0].localeCompare(b[0]));

  if (loading) {
    return <div className="home-loading">Cargando noticias…</div>;
  }

  if (news.length === 0) {
    return (
      <div className="home-page">
        <h1 className="home-heading">Noticias Recientes</h1>
        <p className="home-empty">No hay noticias publicadas aún.</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <h1 className="home-heading" aria-label="Noticias Recientes">
        <span className="home-heading__sr">Noticias Recientes</span>
        {"Noticias Recientes".split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={`home-heading__char${char === " " ? " home-heading__char--space" : ""}`}
            aria-hidden="true"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      <NewsCarousel items={featuredNews} />

      {sections.map(([sectionName, items]) => (
        <section key={sectionName} className="home-section">
          <div className="home-section__header">
            <div className="home-section__title">
              <span className="home-section__kicker">Sección</span>
              <h2>{sectionName}</h2>
            </div>
            <div className="home-section__summary">
              <span className="home-section__summary-label">Noticias</span>
              <span className="home-section__summary-value">{items.length}</span>
            </div>
          </div>
          <div className="news-grid">
            {items.map((item) => (
              <NewsCard key={item.id} noticia={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}