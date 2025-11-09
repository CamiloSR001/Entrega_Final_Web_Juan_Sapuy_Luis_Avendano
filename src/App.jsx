import "./App.css";
import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// Páginas públicas
import Home from "./pages/public/Home";
import Sections from "./pages/public/Sections";
import NewsDetail from "./pages/public/NewsDetail";

// Autenticación
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";

// Panel administrativo
import Dashboard from "./pages/admin/Dashboard";
import NewsForm from "./pages/admin/NewsForm";
import SectionsAdmin from "./pages/admin/SectionsAdmin";
import EditorDashboard from "./pages/admin/EditorDashboard";
import ReporterDashboard from "./pages/admin/ReporterDashboard";

// Utilidades
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import NotFound from "./pages/errors/NotFound";

export default function App() {
  return (
    <Routes>
      {/* rutas publicas abiertas para cualquiera que navegue sin cuenta */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="seccion/:name" element={<Sections />} />
        <Route path="noticia/:id" element={<NewsDetail />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* rutas privadas del panel, aqui solo entran logueados */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="noticias" element={<ReporterDashboard />} />
        <Route path="nueva" element={<NewsForm />} />
        <Route path="editar/:id" element={<NewsForm />} />
        <Route path="secciones" element={<SectionsAdmin />} />
        <Route path="editor" element={<EditorDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
