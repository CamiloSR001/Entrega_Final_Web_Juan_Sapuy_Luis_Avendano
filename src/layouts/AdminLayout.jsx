import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  CssBaseline,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell/NotificationBell";
import "./AdminLayout.css";

const drawerWidth = 240;

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = user?.role === "editor"
    ? [
        { text: "Revisiones", to: "/dashboard/editor" },
        { text: "Gestionar categorías", to: "/dashboard/secciones" },
        { text: "Inicio", to: "/dashboard", exact: true },
      ]
    : [
        { text: "Mis noticias", to: "/dashboard/noticias" },
        { text: "Crear noticia", to: "/dashboard/nueva" },
        { text: "Inicio", to: "/dashboard", exact: true },
      ];

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <>
      <Toolbar />
      {/* la lista lateral con sus brillos y animos */}
      <Box className="admin-menu" sx={{ overflow: "auto", px: 2, pb: 3 }}>
        <List className="admin-menu__list">
          {menuItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.to}
                end={item.exact}
                onClick={() => {
                  if (isMobile) setMobileOpen(false);
                }}
                className="admin-menu__item"
                sx={{
                  mx: 0,
                  my: 0,
                  borderRadius: 3,
                  "&.active": {
                    background: "linear-gradient(150deg, rgba(37, 99, 235, 0.95), rgba(14, 165, 233, 0.78))",
                    boxShadow: "0 26px 56px rgba(14, 99, 233, 0.4)",
                    border: "1px solid rgba(37,211,252,0.65)",
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ className: "admin-menu__label" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <Box
      className="admin-shell"
      sx={{
        display: "flex",
        background: "radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 55%), var(--bg-base)",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(37,99,235,0.82))",
          boxShadow: "0 20px 40px rgba(15,23,42,0.38)",
          borderBottom: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        {/* barra superior donde mostramos menu, campana y boton para salir */}
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: 72,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                aria-label="Abrir menú"
                sx={{ mr: 1 }}
              >
                <MenuRoundedIcon />
              </IconButton>
            )}
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
            Panel Administrativo
          </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.25, md: 2 },
              flexWrap: "nowrap",
            }}
          >
            <NotificationBell iconColor="inherit" />
            <Typography
              variant="body2"
              sx={{
                opacity: 0.85,
                display: { xs: "none", sm: "block" },
                maxWidth: { xs: 120, sm: "none" },
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={user?.email || ""}
            >
              {user?.email}
            </Typography>
            <Button
              variant="contained"
              sx={{
                borderRadius: 999,
                px: { xs: 1.8, md: 2.5 },
                py: 0.8,
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "rgba(255,255,255,0.18)",
                color: "#ffffff",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.28)" },
              }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
        aria-label="Menú lateral"
      >
        {/* menu lateral responsivo, en cel se vuelve drawer flotante */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "linear-gradient(160deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.84))",
              borderRight: "1px solid rgba(59,130,246,0.25)",
              boxShadow: "0 22px 44px rgba(15,23,42,0.35)",
              paddingTop: "12px",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "linear-gradient(160deg, rgba(15, 23, 42, 0.94), rgba(30, 64, 175, 0.82))",
              borderRight: "1px solid rgba(59,130,246,0.28)",
              boxShadow: "0 22px 44px rgba(15,23,42,0.32)",
              paddingTop: "12px",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="admin-shell__main"
        sx={{
          flexGrow: 1,
          bgcolor: "transparent",
          p: { xs: 3, md: 4 },
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* aqui dibujamos lo que toca segun la ruta interna */}
        <Toolbar />
        <Box
          className="admin-shell__canvas"
          sx={{
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
            borderRadius: 3,
            border: "1px solid rgba(148,163,184,0.16)",
            p: { xs: 2.5, md: 4 },
          }}
        >
          {/* el outlet pinta cada pantalla del dashboard sin recargar la pagina */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
