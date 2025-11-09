import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "../../firebase";
import { supabase } from "../../supabaseconfig/supabaseClient";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [existingStoragePath, setExistingStoragePath] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Edición");
  const [returnedFlag, setReturnedFlag] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesRef = collection(firebaseDb, "categories");
        const categoriesQuery = query(categoriesRef, orderBy("name", "asc"));
        const snapshot = await getDocs(categoriesQuery);
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setCategories(list);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsRef = doc(firebaseDb, "news", id);
        const newsSnap = await getDoc(newsRef);

        if (!newsSnap.exists()) {
          setMessage("No se encontró la noticia solicitada.");
          setLoading(false);
          return;
        }

        const data = newsSnap.data();

        if (user && user.role === "reportero" && user.id !== data.authorId) {
          setMessage("No tienes permiso para editar esta noticia.");
          setLoading(false);
          return;
        }

        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setContent(data.content || "");
        setCategoryId(data.categoryId || "");
        setExistingImage(data.imageUrl || null);
        setExistingStoragePath(data.storagePath || null);
        setStatus(data.status || "Edición");
        setReturnedFlag(Boolean(data.returned));
      } catch (error) {
        console.error("Error cargando la noticia:", error);
        setMessage("No fue posible cargar la noticia para edición.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, isEdit, user]);

  const handleImageUpload = async (newsId) => {
    if (!imageFile) {
      return {
        imageUrl: existingImage || null,
        storagePath: existingStoragePath || null,
      };
    }

    const extension = imageFile.name.split(".").pop();
    const filePath = `news/${newsId}/${Date.now()}.${extension}`;

    setUploading(true);
    const { error } = await supabase.storage.from("news-images").upload(filePath, imageFile, {
      upsert: false,
    });
    setUploading(false);

    if (error) {
      console.error("Error al subir imagen:", error);
      throw new Error("Error al subir la imagen.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("news-images").getPublicUrl(filePath);

    return {
      imageUrl: publicUrl,
      storagePath: filePath,
    };
  };

  const resetFields = () => {
    setTitle("");
    setSubtitle("");
    setContent("");
    setCategoryId("");
    setImageFile(null);
    setExistingImage(null);
    setExistingStoragePath(null);
    setReturnedFlag(false);
  };

  const notifyEditors = async ({ newsId, titleValue, statusValue, messageText }) => {
    try {
      const profilesRef = collection(firebaseDb, "profiles");
      const editorsSnapshot = await getDocs(query(profilesRef, where("role", "==", "editor")));
      if (editorsSnapshot.empty) return;

      const batch = writeBatch(firebaseDb);
      editorsSnapshot.forEach((editorDoc) => {
        const notificationRef = doc(collection(firebaseDb, "notificationStates"));
        batch.set(notificationRef, {
          userId: editorDoc.id,
          newsId,
          role: "editor",
          type: "news_pending_review",
          title: titleValue,
          status: statusValue,
          message: messageText || "Nueva noticia en revisión",
          updatedAt: Date.now(),
          read: false,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error enviando notificación a editores:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const authUser = firebaseAuth.currentUser;
      if (!authUser) {
        setMessage("No se encontró la sesión del usuario.");
        return;
      }

      if (!categoryId) {
        setMessage("Debes seleccionar una categoría.");
        return;
      }

      if (!imageFile && !existingImage) {
        setMessage("Debes subir una imagen para la noticia.");
        return;
      }

      const category = categories.find((cat) => cat.id === categoryId);
      const categoryName = category?.name || "General";

      if (isEdit) {
        const newsRef = doc(firebaseDb, "news", id);

        const { imageUrl, storagePath } = await handleImageUpload(id);

        await updateDoc(newsRef, {
          title,
          subtitle,
          content,
          categoryId,
          categoryName,
          imageUrl,
          storagePath,
          status,
          returned: status === "Edición" ? returnedFlag : false,
          updatedAt: serverTimestamp(),
        });

        setMessage("✅ Noticia actualizada correctamente");
        navigate(-1);
      } else {
        const newsCollection = collection(firebaseDb, "news");
        const newsRef = doc(newsCollection);
        const newsId = newsRef.id;

        const { imageUrl, storagePath } = await handleImageUpload(newsId);

        await setDoc(newsRef, {
          title,
          subtitle,
          content,
          categoryId,
          categoryName,
          imageUrl,
          storagePath,
          authorId: authUser.uid,
          authorEmail: user?.email || authUser.email || "",
          authorUsername: user?.username || authUser.email?.split("@")[0] || "",
          status: "Edición",
          returned: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await notifyEditors({
          newsId,
          titleValue: title,
          statusValue: "Edición",
          messageText: "Nueva noticia en edición",
        });

        setMessage("✅ Noticia creada exitosamente");
        resetFields();
      }
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error al guardar la noticia.");
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? "Editar noticia" : "Crear nueva noticia"}
      </Typography>

      {loading ? (
        <Typography>Cargando información…</Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Título"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Subtítulo"
            fullWidth
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoryId}
              label="Categoría"
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Contenido"
            multiline
            rows={6}
            fullWidth
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button variant="contained" component="label">
              {isEdit ? "Cambiar imagen" : "Subir imagen"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </Button>
            {(existingImage || imageFile) && (
              <Typography variant="body2" color="text.secondary">
                {imageFile ? imageFile.name : "Actualmente: imagen cargada"}
              </Typography>
            )}
          </Stack>

          {(imageFile || existingImage) && (
            <Box
              component="img"
              src={imageFile ? URL.createObjectURL(imageFile) : existingImage}
              alt="Vista previa"
              sx={{ width: "100%", borderRadius: 2, mb: 2, objectFit: "cover", maxHeight: 320 }}
            />
          )}

          <Button type="submit" variant="contained" color="primary" disabled={uploading}>
            {isEdit ? "Guardar cambios" : "Guardar noticia"}
          </Button>

          {message && (
            <Typography
              sx={{ mt: 2 }}
              color={
                message.startsWith("Debes") ||
                message.startsWith("No se encontró") ||
                message.startsWith("Ocurrió")
                  ? "error"
                  : "success.main"
              }
            >
              {message}
            </Typography>
          )}
        </form>
      )}
    </Box>
  );
}
