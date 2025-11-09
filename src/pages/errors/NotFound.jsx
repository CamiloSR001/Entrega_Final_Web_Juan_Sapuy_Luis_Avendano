import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Box sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h3">404</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Página no encontrada
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Volver al inicio
      </Button>
    </Box>
  );
}
