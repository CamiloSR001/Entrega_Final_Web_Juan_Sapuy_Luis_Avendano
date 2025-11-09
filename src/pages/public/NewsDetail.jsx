import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firebaseDb } from "../../firebase";
import {
  Box,
  Typography,
  Divider,
  Button,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";

const formatDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";
  try {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime())
      ? "Fecha no disponible"
      : date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  } catch (error) {
    return "Fecha no disponible";
  }
};

const getAuthorLabel = (author) => {
  if (!author) return "Autor desconocido";
  const username = author.username && author.username.trim();
  const email = author.email && author.email.trim();
  if (username && email) return `${username} (${email})`;
  return username || email || "Autor desconocido";
};

export default function NewsDetail() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticia = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const newsRef = doc(firebaseDb, "news", id);
        const newsSnap = await getDoc(newsRef);

        if (!newsSnap.exists()) {
          setError("No se encontró la noticia");
          setLoading(false);
          return;
        }

        const data = newsSnap.data();
        if (data.status !== "Publicado") {
          setError("Esta noticia no está publicada");
          setLoading(false);
          return;
        }

        const mapped = {
          id: newsSnap.id,
          title: data.title || "",
          subtitle: data.subtitle || "",
          content: data.content || "",
          categoryName: data.categoryName || "General",
          imageUrl: data.imageUrl || data.image_url || "",
          author: {
            username: data.authorUsername || "",
            email: data.authorEmail || "",
          },
          createdAt:
            data.createdAt?.toDate?.() instanceof Date
              ? data.createdAt.toDate().toISOString()
              : data.createdAt || null,
          updatedAt:
            data.updatedAt?.toDate?.() instanceof Date
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt || null,
        };

        setNoticia(mapped);
      } catch (err) {
        console.error("Error al cargar la noticia:", err);
        setError("Error al cargar la noticia");
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          ← Volver al inicio
        </Button>
      </Container>
    );
  }

  if (!noticia) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" color="error" sx={{ mt: 2 }}>
          No se encontró la noticia.
        </Typography>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          ← Volver al inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
          {noticia.title}
        </Typography>

        <Typography variant="h5" color="text.secondary" gutterBottom>
          {noticia.subtitle}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {noticia.categoryName || "General"} — {formatDate(noticia.createdAt || noticia.updatedAt)}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Autor: {getAuthorLabel(noticia.author)}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {noticia.imageUrl && (
          <Box sx={{ mb: 3 }}>
            <img
              src={noticia.imageUrl}
              alt={noticia.title}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            mt: 3,
            lineHeight: 1.8,
            fontSize: "1.1rem",
            whiteSpace: "pre-line",
          }}
        >
          {noticia.content || "Contenido no disponible."}
        </Typography>

        <Button component={Link} to="/" variant="outlined" sx={{ mt: 4 }}>
          ← Volver al inicio
        </Button>
      </Box>
    </Container>
  );
}