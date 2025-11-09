import React, { useState } from "react";
import PropTypes from "prop-types";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  Badge,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { useNotifications } from "../../hooks/useNotifications";
import "./NotificationBell.css";

export default function NotificationBell({ iconColor = "inherit" }) {
  const { notifications, clearNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleClear = async () => {
    await clearNotifications();
    closeMenu();
  };

  return (
    <>
      <IconButton color={iconColor} onClick={openMenu} aria-label="Notificaciones">
        <Badge color="error" badgeContent={notifications.length}>
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu} keepMounted>
        {notifications.length === 0 ? (
          <MenuItem disabled>No tienes notificaciones nuevas</MenuItem>
        ) : (
          <Box className="notification-bell__menu">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Actividad reciente
              </Typography>
              <Chip label={notifications.length} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Box className="notification-bell__list">
              {notifications.map((note) => (
                <Box key={note.id} className="notification-bell__item">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {note.title || "Noticia"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {note.message || `Estado: ${note.status || "Actualizado"}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.updatedAt || Date.now()).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Button onClick={handleClear} variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 600, textTransform: "none" }}>
              Marcar como leídas
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}

NotificationBell.propTypes = {
  iconColor: PropTypes.string,
};
