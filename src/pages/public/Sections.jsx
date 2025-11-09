import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Grid, CircularProgress, Box, Button, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firebaseDb } from "../../firebase";
import NewsCard from "../../components/NewsCard/NewsCard";
import { mapNewsDoc } from "../../utils/newsMapping";

export default function Sections() {
  const { name } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!name) return () => {};

    let unsubscribeNews = () => {};
    let isActive = true;

    const fetchCategoryAndNews = async () => {
      setLoading(true);

      try {
        const categoriesRef = collection(firebaseDb, "categories");
        const categoryQuery = query(categoriesRef, where("nameLowercase", "==", name.toLowerCase()));
        const categorySnapshot = await getDocs(categoryQuery);

        if (!isActive) return;

        if (categorySnapshot.empty) {
          setCategory(null);
          setNews([]);
          setLoading(false);
          return;
        }

        const categoryDoc = categorySnapshot.docs[0];
        const categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
        setCategory(categoryData);

        const newsRef = collection(firebaseDb, "news");
            const newsQuery = query(
              newsRef,
              where("categoryId", "==", categoryDoc.id),
              where("status", "==", "Publicado")
            );

        unsubscribeNews = onSnapshot(
          newsQuery,
              (snapshot) => {
            if (!isActive) return;
                const items = snapshot.docs.map(mapNewsDoc);
                items.sort((a, b) => {
                  const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
                  const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
                  return dateB - dateA;
                });
                setNews(items);
            setLoading(false);
          },
          (error) => {
            console.error("Error al cargar noticias de la sección:", error);
            if (!isActive) return;
            setNews([]);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error general:", error);
        if (isActive) {
          setNews([]);
          setLoading(false);
        }
      }
    };

    fetchCategoryAndNews();

    return () => {
      isActive = false;
      unsubscribeNews();
    };
  }, [name]);

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <Box sx={{ overflowX: "hidden" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }} alignItems={{ xs: "stretch", sm: "center" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleGoBack}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Volver al inicio
        </Button>
        <Typography variant="h4" sx={{ mb: { xs: 1, sm: 0 } }}>
          Sección: {category?.name || name || "Categoría"}
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : news.length > 0 ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {news.map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n.id}>
              <NewsCard noticia={n} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No hay noticias publicadas en esta sección.
        </Typography>
      )}
    </Box>
  );
}