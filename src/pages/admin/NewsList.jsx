import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseDb } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";

export default function NewsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const newsRef = collection(firebaseDb, "news");
    const newsQuery = query(
      newsRef,
      where("authorId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      newsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
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
  }, [user?.id]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mis Noticias
      </Typography>

      {news.length === 0 ? (
        <Typography>No has creado ninguna noticia aún.</Typography>
      ) : (
        news.map((item) => (
          <Card key={item.id} sx={{ mb: 3 }}>
            {item.imageUrl && (
              <CardMedia component="img" height="180" image={item.imageUrl} alt={item.title} />
            )}

            <CardContent>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {item.subtitle}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Chip
                  label={item.status}
                  color={
                    item.status === "Publicado"
                      ? "success"
                      : item.status === "Terminado"
                      ? "warning"
                      : item.status === "Desactivado"
                      ? "error"
                      : "default"
                  }
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "Sin fecha"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/dashboard/editar/${item.id}`)}
                >
                  Editar
                </Button>

                {(item.status === "Edición" || item.status === "Desactivado") && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={updating === item.id}
                    onClick={async () => {
                      setUpdating(item.id);
                      try {
                        const newsRef = doc(firebaseDb, "news", item.id);
                        await updateDoc(newsRef, {
                          status: "Terminado",
                          updatedAt: serverTimestamp(),
                        });
                      } catch (error) {
                        console.error("Error al marcar como terminado:", error);
                        alert("No se pudo actualizar el estado.");
                      } finally {
                        setUpdating(null);
                      }
                    }}
                  >
                    {updating === item.id ? "Actualizando..." : "Marcar como 'Terminado'"}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
