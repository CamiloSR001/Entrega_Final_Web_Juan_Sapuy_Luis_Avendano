import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginImage =
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-visual auth-visual--login">
          <img
            src={loginImage}
            alt="Equipo editorial revisando noticias en un computador portátil"
            loading="lazy"
          />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Iniciar sesión</h1>
          <p className="auth-description">Ingresa tus credenciales institucionales</p>

          <label className="auth-field">
            <span><MailRoundedIcon />Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.com"
              required
            />
          </label>

          <label className="auth-field">
            <span><LockRoundedIcon />Contraseña</span>
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="auth-toggle"
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </button>
            </div>
          </label>

          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button type="submit" className="auth-submit">
            Acceder al panel
          </button>

          <p className="auth-footer">
            ¿No tienes cuenta? <Link to="/auth/register">Crear una cuenta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;

