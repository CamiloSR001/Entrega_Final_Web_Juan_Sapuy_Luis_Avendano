import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { firebaseDb } from "../../firebase";
import { mapNewsDoc } from "../../utils/newsMapping";
import "./AdminPanels.css";

const STATUS_ORDER = [
  { key: "Edición", label: "En edición" },
  { key: "Devuelto", label: "Devueltas" },
  { key: "Terminado", label: "Pendientes de aprobación" },
  { key: "Publicado", label: "Publicadas" },
  { key: "Desactivado", label: "Desactivadas" },
];

export default function ReporterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [tab, setTab] = useState(STATUS_ORDER[0].key);
  const statusesToNotify = useRef(new Set(["Terminado", "Publicado", "Desactivado"]));
  const statusTrackerRef = useRef(new Map());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!user?.id) return;

    const newsRef = collection(firebaseDb, "news");
    const newsQuery = query(
      newsRef,
      where("authorId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribeNews = onSnapshot(
      newsQuery,
      (snapshot) => {
        const items = snapshot.docs.map(mapNewsDoc);
        setNews(items);

        snapshot.docChanges().forEach((change) => {
          const docSnap = change.doc;
          const mapped = mapNewsDoc(docSnap);
          const previousStatus = statusTrackerRef.current.get(mapped.id);
          statusTrackerRef.current.set(mapped.id, mapped.status);

          const changeTime =
            docSnap.updateTime?.toMillis?.() ??
            docSnap.updateTime?.toDate?.().getTime?.() ??
            docSnap.createTime?.toMillis?.() ??
            Date.now();

          const notificationId = `reporter_${user.id}_${mapped.id}`;

          if (change.type === "added") {
            if (initialLoadRef.current || !statusesToNotify.current.has(mapped.status)) {
              return;
            }
            setDoc(
              doc(firebaseDb, "notificationStates", notificationId),
              {
                userId: user.id,
                newsId: mapped.id,
                role: "reporter",
                type: "news_status_change",
                title: mapped.title,
                status: mapped.status,
                updatedAt: changeTime,
                read: false,
              },
              { merge: true }
            ).catch((error) => console.error("Error guardando notificación:", error));
            return;
          }

          if (change.type === "modified") {
            if (previousStatus === mapped.status || !statusesToNotify.current.has(mapped.status)) {
              return;
            }
            setDoc(
              doc(firebaseDb, "notificationStates", notificationId),
              {
                userId: user.id,
                newsId: mapped.id,
                role: "reporter",
                type: "news_status_change",
                title: mapped.title,
                status: mapped.status,
                updatedAt: changeTime,
                read: false,
              },
              { merge: true }
            ).catch((error) => console.error("Error guardando notificación:", error));
          }
        });

        initialLoadRef.current = false;
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

  const markAsFinished = async (newsItem) => {
    setUpdating(newsItem.id);
    try {
      const newsRef = doc(firebaseDb, "news", newsItem.id);
      await updateDoc(newsRef, {
        status: "Terminado",
        returned: false,
        updatedAt: serverTimestamp(),
      });

      const profilesRef = collection(firebaseDb, "profiles");
      const editorsSnapshot = await getDocs(query(profilesRef, where("role", "==", "editor")));
      if (!editorsSnapshot.empty) {
        const batch = writeBatch(firebaseDb);
        editorsSnapshot.forEach((editorDoc) => {
          const notificationRef = doc(collection(firebaseDb, "notificationStates"));
          batch.set(notificationRef, {
            userId: editorDoc.id,
            newsId: newsItem.id,
            role: "editor",
            type: "news_ready_for_review",
            title: newsItem.title,
            status: "Terminado",
            updatedAt: Date.now(),
            read: false,
          });
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error al marcar como terminado:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setUpdating(null);
    }
  };

  const groupedNews = useMemo(() => {
    const sortedNews = [...news].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0);
      const bDate = new Date(b.updatedAt || b.createdAt || 0);
      return bDate - aDate;
    });

    return STATUS_ORDER.map(({ key, label }) => {
      let items = [];
      if (key === "Devuelto") {
        items = sortedNews.filter((item) => item.status === "Edición" && item.returned);
      } else if (key === "Edición") {
        items = sortedNews.filter((item) => item.status === "Edición" && !item.returned);
      } else {
        items = sortedNews.filter((item) => item.status === key);
      }
      return { status: key, label, items };
    });
  }, [news]);

  const currentGroup = groupedNews.find((group) => group.status === tab) || {
    status: tab,
    label: STATUS_ORDER.find((st) => st.key === tab)?.label || "",
    items: [],
  };

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
          <h2 className="panel-header__title">Mis noticias</h2>
          <p className="panel-header__subtitle">
            Gestiona tus notas según su estado editorial. Marca como “Terminado” cuando estén listas para revisión del editor.
          </p>
        </div>
      </section>

      {/* tabs para cambiar entre estados sin recargar */}
      <Tabs
        className="panel-tabs"
        value={tab}
        onChange={(_e, value) => setTab(value)}
        textColor="primary"
        indicatorColor="primary"
      >
        {groupedNews.map(({ status, label, items }) => (
          <Tab key={status} value={status} label={`${label} (${items.length})`} sx={{ textTransform: "none" }} />
        ))}
      </Tabs>

      {currentGroup.items.length === 0 ? (
        <Typography variant="body2" color="rgba(226,232,240,0.75)">
          No hay noticias en esta categoría.
        </Typography>
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
                    <span>{formatDateLabel(n.updatedAt, n.createdAt)}</span>
                  </div>
                  <div className="panel-card__actions">
                    <Button variant="outlined" size="small" onClick={() => navigate(`/dashboard/editar/${n.id}`)}>
                      Editar
                    </Button>
                    {(n.status === "Edición" || n.status === "Desactivado") && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={updating === n.id}
                        onClick={() => markAsFinished(n)}
                      >
                        {updating === n.id ? "Actualizando..." : "Marcar como 'Terminado'"}
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

const formatDateLabel = (value, fallbackDate) => {
  const target = value || fallbackDate;
  if (!target) return "Sin fecha";
  if (target?.toDate) {
    const date = target.toDate();
    return Number.isNaN(date.getTime()) ? "Sin fecha" : date.toLocaleDateString();
  }
  const parsed = new Date(target);
  return Number.isNaN(parsed.getTime()) ? "Sin fecha" : parsed.toLocaleDateString();
};
