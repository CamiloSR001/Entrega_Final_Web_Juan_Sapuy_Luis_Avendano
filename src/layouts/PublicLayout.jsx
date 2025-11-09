import React, { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firebaseDb } from "../firebase";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./PublicLayout.css";

export default function PublicLayout() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoriesRef = collection(firebaseDb, "categories");
    const categoriesQuery = query(categoriesRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setCategories(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error cargando categorías:", error);
        setCategories([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderCategories = (className = "") => (
    <aside className={`category-panel ${className}`}>
      <h2>Secciones</h2>

      {loading ? (
        <p className="category-loading">Cargando secciones…</p>
      ) : categories.length === 0 ? (
        <p className="category-empty">Aún no hay secciones creadas.</p>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              <NavLink
                to={`/seccion/${cat.name}`}
                className={({ isActive }) =>
                  isActive ? "category-link category-link--active" : "category-link"
                }
              >
                {cat.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );

  return (
    <>
      <Header categories={renderCategories("category-panel--mobile")} />

      <div className="page-wrapper">
        <div className="public-layout">
          <div className="category-panel-wrapper">{renderCategories()}</div>

          <main className="public-content">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
