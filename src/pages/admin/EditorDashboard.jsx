import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { firebaseDb } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./AdminPanels.css";

const STATUS_TABS = [
  { key: "PENDING", label: "Pendientes", includes: ["Edición", "Terminado"] },
  { key: "PUBLISHED", label: "Publicadas", includes: ["Publicado"] },
  { key: "DISABLED", label: "Desactivadas", includes: ["Desactivado"] },
];

const toIso = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.toDate) {
    const date = value.toDate();
    return date instanceof Date ? date.toISOString() : null;
  }
  if (value instanceof Date) return value.toISOString();
  return null;
};

const mapNewsItem = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title || "",
    subtitle: data.subtitle || "",
    status: data.status || "Edición",
    returned: Boolean(data.returned),
    imageUrl: data.imageUrl || "",
    author: {
      id: data.authorId || "",
      username: data.authorUsername || "",
      email: data.authorEmail || "",
    },
    createdAt: toIso(data.createdAt) || toIso(data.createdAtIso) || null,
    updatedAt: toIso(data.updatedAt) || toIso(data.updatedAtIso) || null,
  };
};

const STATUS_LABELS = {
  Publicado: "Tu noticia fue publicada",
  Edición: "Tu noticia fue devuelta a edición",
  Desactivado: "Tu noticia fue desactivada",
  Terminado: "Tu noticia fue marcada como terminada",
};

export default function EditorDashboard() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [tab, setTab] = useState("PENDING");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const newsRef = collection(firebaseDb, "news");
    const newsQuery = query(newsRef, orderBy("createdAt", "desc"));

    const unsubscribeNews = onSnapshot(
      newsQuery,
      (snapshot) => {
        const items = snapshot.docs.map(mapNewsItem);
        setNews(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar noticias:", error);
        setNews([]);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeNews();
    };
  }, [user?.id]);

  const updateStatus = async (newsItem, newStatus) => {
    setUpdating(newsItem.id);
    try {
      const newsRef = doc(firebaseDb, "news", newsItem.id);
      await updateDoc(newsRef, {
        status: newStatus,
        returned: newStatus === "Edición",
        updatedAt: serverTimestamp(),
      });

      if (newsItem.author?.id) {
        const notificationRef = doc(collection(firebaseDb, "notificationStates"));
        await setDoc(notificationRef, {
          userId: newsItem.author.id,
          newsId: newsItem.id,
          role: "reporter",
          type: "news_status_change",
          title: newsItem.title,
          status: newStatus,
          message: STATUS_LABELS[newStatus] || "",
          updatedAt: Date.now(),
          read: false,
        });
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setUpdating(null);
    }
  };

  const groupedNews = useMemo(() => {
    return STATUS_TABS.map(({ key, includes }) => ({
      key,
      items: news.filter((n) => includes.includes(n.status)),
    }));
  }, [news]);

  const currentGroup = groupedNews.find((group) => group.key === tab) || { items: [] };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="panel-wrapper" sx={{ mt: { xs: 1, md: 2 } }}>
      <section className="panel-header">
        <div className="panel-header__content">
          <h2 className="panel-header__title">Panel del editor</h2>
          <p className="panel-header__subtitle">
            Supervisa el flujo editorial, impulsa las publicaciones y mantiene el estándar corporativo en cada noticia.
          </p>
        </div>
      </section>

      {/* tabs para moverse entre pendientes, publicadas y desactivadas */}
      <Tabs
        className="panel-tabs"
        value={tab}
        onChange={(_e, value) => setTab(value)}
        textColor="primary"
        indicatorColor="primary"
      >
        {STATUS_TABS.map((t) => (
          <Tab
            key={t.key}
            label={`${t.label} (${groupedNews.find((g) => g.key === t.key)?.items.length || 0})`}
            value={t.key}
            sx={{ textTransform: "none" }}
          />
        ))}
      </Tabs>

      {currentGroup.items.length === 0 ? (
        <Typography color="rgba(226,232,240,0.75)">No hay noticias en esta categoría.</Typography>
      ) : (
        <Grid container spacing={2}>
          {currentGroup.items.map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n.id}>
              <Card className="panel-card">
                {n.imageUrl && <CardMedia component="img" height="160" image={n.imageUrl} alt={n.title} />}
                <CardContent className="panel-card__content">
                  <Typography variant="h6" className="panel-card__title">
                    {n.title}
                  </Typography>
                  <Typography variant="body2" color="rgba(226,232,240,0.75)">
                    {n.subtitle || "Sin subtítulo"}
                  </Typography>
                  <div className="panel-card__meta">
                    <span className="panel-card__meta-chip">{n.returned ? "Devuelta" : n.status}</span>
                    <span>
                      {(() => {
                        const username = n.author?.username?.trim();
                        const email = n.author?.email?.trim();
                        if (username && email) return `${username} (${email})`;
                        return username || email || "Autor desconocido";
                      })()}
                    </span>
                  </div>

                  <div className="panel-card__actions">
                    <Button
                      key="editar"
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/dashboard/editar/${n.id}`)}
                    >
                      Editar
                    </Button>
                    {(n.status === "Edición" || n.status === "Terminado") && (
                      <Button
                        key="publicar"
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={updating === n.id}
                        onClick={() => updateStatus(n, "Publicado")}
                      >
                        Publicar
                      </Button>
                    )}

                    {n.status === "Terminado" && (
                      <Button
                        key="devolver"
                        variant="outlined"
                        color="warning"
                        size="small"
                        disabled={updating === n.id}
                        onClick={() => updateStatus(n, "Edición")}
                      >
                        Devolver
                      </Button>
                    )}

                    {n.status === "Publicado" && (
                      <Button
                        key="desactivar"
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={updating === n.id}
                        onClick={() => updateStatus(n, "Desactivado")}
                      >
                        Desactivar
                      </Button>
                    )}

                    {n.status === "Desactivado" && (
                      <Button
                        key="reactivar"
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={updating === n.id}
                        onClick={() => updateStatus(n, "Publicado")}
                      >
                        Reactivar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}


