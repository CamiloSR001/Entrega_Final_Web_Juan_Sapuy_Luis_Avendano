import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Button, CircularProgress, Typography } from "@mui/material";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const shortcuts = useMemo(() => {
    if (!user) return [];

    if (user.role === "editor") {
      return [
        {
          title: "Revisiones pendientes",
          description: "Aprueba, publica o devuelve noticias enviadas por tu equipo.",
          action: () => navigate("/dashboard/editor"),
          buttonLabel: "Ir a revisiones",
          icon: <AssignmentTurnedInRoundedIcon fontSize="large" />,
        },
        {
          title: "Gestionar categorías",
          description: "Crea o ajusta las categorías del portal público.",
          action: () => navigate("/dashboard/secciones"),
          buttonLabel: "Administrar categorías",
          icon: <CategoryRoundedIcon fontSize="large" />,
        },
      ];
    }

    return [
      {
        title: "Mis noticias",
        description: "Edita tus borradores, revisa el estado y envía noticias a revisión.",
        action: () => navigate("/dashboard/noticias"),
        buttonLabel: "Ver mis noticias",
        icon: <NewspaperRoundedIcon fontSize="large" />,
      },
      {
        title: "Crear noticia",
        description: "Redacta una nueva noticia y súbela con su imagen correspondiente.",
        action: () => navigate("/dashboard/nueva"),
        buttonLabel: "Crear noticia",
        icon: <AddCircleRoundedIcon fontSize="large" />,
      },
    ];
  }, [user, navigate]);

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const greetingName = user.username || user.email || "usuario";
  const isEditor = user.role === "editor";
  const roleLabel = isEditor ? "Editor" : "Reportero";
  const initials = greetingName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box className="dashboard-wrapper">
      <section className="dashboard-hero">
        <div className="dashboard-hero__inner">
          <div className="dashboard-hero__headline">
            <div className="dashboard-pill">
              <AutoAwesomeRoundedIcon fontSize="small" /> Área Administrativa
            </div>
            <h1>Hola, {greetingName} 👋</h1>
            <p className="dashboard-hero__subtext">
              {isEditor
                ? "Coordina al equipo editorial, revisa solicitudes en tiempo real y mantén la redacción alineada al estilo corporativo."
                : "Centraliza tus notas, controla el flujo de aprobación y lleva tus historias al siguiente nivel con un entorno ágil."}
            </p>
            <div className="dashboard-hero__actions">
              <span className="dashboard-pill">Rol: {roleLabel}</span>
              <span className="dashboard-pill">
                <RocketLaunchRoundedIcon fontSize="small" /> Sesión activa
              </span>
            </div>
          </div>
          <Avatar className="dashboard-hero__avatar">{initials}</Avatar>
        </div>
      </section>

      <div className="dashboard-shortcuts">
        {shortcuts.map((card) => (
          <article key={card.title} className="dashboard-card">
            <div className="dashboard-card__icon">{card.icon}</div>
            <h3 className="dashboard-card__title">{card.title}</h3>
            <p className="dashboard-card__description">{card.description}</p>
            <Button
              type="button"
              className="dashboard-card__button"
              onClick={card.action}
            >
              {card.buttonLabel}
            </Button>
          </article>
        ))}
      </div>
    </Box>
  );
}
