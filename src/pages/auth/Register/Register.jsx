import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reportero");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const registerImage =
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await register(email, password, role, username);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(error.message || "No se pudo registrar el usuario.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-visual auth-visual--register">
          <img
            src={registerImage}
            alt="Profesionales colaborando en la creación de contenido"
            loading="lazy"
          />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Registro</h1>
          <p className="auth-description">Completa la información para solicitar acceso</p>

          <label className="auth-field">
            <span><AccountCircleRoundedIcon />Nombre de usuario</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu identificador único"
              required
            />
          </label>

          <label className="auth-field">
            <span><MailRoundedIcon />Correo electrónico institucional</span>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>

          <label className="auth-field">
            <span><WorkspacePremiumRoundedIcon />Rol solicitado</span>
            <div className="auth-select">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="reportero">Reportero</option>
                <option value="editor">Editor</option>
              </select>
            </div>
          </label>

          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button type="submit" className="auth-submit">
            Solicitar acceso
          </button>

          <p className="auth-footer">
            ¿Ya tienes cuenta? <Link to="/auth/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;

