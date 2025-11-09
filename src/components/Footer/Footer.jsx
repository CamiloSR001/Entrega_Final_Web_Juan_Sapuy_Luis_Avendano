import React from "react";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      {/* bloque principal con descripcion, equipo y redes sociales */}
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-section">
            <h3>Noticias Corporativas</h3>
            <p>Noticias del mundo con sello de una empresa colombiana.</p>
          </div>

          <div className="footer-section">
            <h4>Equipo editorial</h4>
            <p>
              <PersonRoundedIcon />
              Luis Enrique Avendaño Ortiz
            </p>
            <p>
              <PersonRoundedIcon />
              Juan Camilo Sapuy Romero
            </p>
          </div>

          <div className="footer-section">
            <h4>Redes sociales</h4>
            <p>
              <TwitterIcon />
              <a href="https://x.com/LuisNapolo12673" target="_blank" rel="noreferrer">
                @LuisNapolo12673
              </a>
            </p>
            <p>
              <FacebookRoundedIcon />
              <a href="https://www.facebook.com/share/1AiZHy5SZp/?mibextid=wwXIfr" target="_blank" rel="noreferrer">
              @Luis Enrique Avendaño
              </a>
            </p>
            <p>
              <InstagramIcon />
              <a
                href="https://www.instagram.com/luisckr7?igsh=OGphd2x4Nmx6cWNn&utm_source=qr"
                target="_blank"
                rel="noreferrer"
              >
                @luisckr7
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* piecito legal para recordar que somos del equipo de comunicaciones */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Unidad de Comunicaciones Internas</p>
      </div>
    </footer>
  );
}

export default Footer;

