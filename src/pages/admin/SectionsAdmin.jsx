import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { firebaseDb } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function SectionsAdmin() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesRef = collection(firebaseDb, "categories");
      const categoriesQuery = query(categoriesRef, orderBy("name", "asc"));
      const snapshot = await getDocs(categoriesQuery);
      const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setCategories(list);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    const trimmed = newCategory.trim();
    if (trimmed === "") {
      alert("El nombre de la categoría no puede estar vacío");
      return;
    }

    setSaving(true);
    try {
      const categoriesRef = collection(firebaseDb, "categories");
      await addDoc(categoriesRef, {
        name: trimmed,
        nameLowercase: trimmed.toLowerCase(),
        createdAt: new Date().toISOString(),
      });
      setNewCategory("");
      await fetchCategories();
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      alert("❌ No se pudo agregar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const updateCategory = async () => {
    const trimmed = editingName.trim();
    if (!editingId || trimmed === "") {
      alert("El nombre de la categoría no puede estar vacío");
      return;
    }

    setUpdatingId(editingId);
    try {
      const categoryRef = doc(firebaseDb, "categories", editingId);
      await updateDoc(categoryRef, {
        name: trimmed,
        nameLowercase: trimmed.toLowerCase(),
        updatedAt: new Date().toISOString(),
      });
      await fetchCategories();
      cancelEditing();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert("❌ No se pudo actualizar la categoría.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCategory = async (id) => {
    const confirmDelete = window.confirm("¿Seguro que quieres eliminar esta categoría?");
    if (!confirmDelete) return;

    try {
      const categoryRef = doc(firebaseDb, "categories", id);
      await deleteDoc(categoryRef);
      await fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert("❌ No se pudo eliminar la categoría.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (user.role !== "editor") {
    return (
      <Typography variant="h6" color="error" sx={{ mt: 4 }}>
        No tienes permiso para acceder a esta sección.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestionar categorías
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            label="Nueva categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addCategory}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Agregar"}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No hay categorías registradas aún.
          </Typography>
        ) : (
          <Box
            sx={{
              maxHeight: { xs: 280, sm: 360 },
              overflowY: "auto",
              pr: 1,
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(148,163,184,0.5)",
                borderRadius: 999,
              },
            }}
          >
            <List dense>
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;
                return (
                  <ListItem
                    key={cat.id}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        {isEditing ? (
                          <>
                            <IconButton
                              edge="end"
                              color="success"
                              onClick={updateCategory}
                              disabled={updatingId === cat.id}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton edge="end" color="inherit" onClick={cancelEditing}>
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton edge="end" color="primary" onClick={() => startEditing(cat)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton edge="end" color="error" onClick={() => deleteCategory(cat.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    }
                  >
                    {isEditing ? (
                      <TextField
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <ListItemText
                        primary={cat.name}
                        secondary={cat.createdAt ? `Creada el ${new Date(cat.createdAt).toLocaleDateString()}` : ""}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
