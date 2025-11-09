CMS de noticias corporativas

Resumen:
La aplicación funciona como un CMS para el equipo de comunicaciones. El frontend está hecho con React + Vite y Material UI. Los datos de usuarios, roles y noticias viven en Firebase (Auth + Firestore) y las imágenes se guardan en Supabase Storage. También se guarda un registro de notificaciones en Firestore para avisarle a editores y reporteros cuando cambia el estado de una noticia.

Estructura general:
- src/App.jsx define las rutas públicas y privadas.
- src/components/ contiene piezas reutilizables: Header, NavBar, NotificationBell, etc. Cada componente tiene su propio archivo de estilos.
- src/context/AuthContext.jsx maneja la sesión del usuario, carga el perfil y expone login, register y logout.
- src/layouts/ agrupa PublicLayout y AdminLayout, los dos cascarones principales de la app.
- src/pages/ se divide en public (Home, Sección, Detalle), auth (Login y Registro) y admin (panel general, panel de reportero, panel de editor, secciones y formulario de noticias).
- src/hooks/ guarda lógica reutilizable como useNotifications.
- src/utils/ contiene helpers para mapear documentos de Firestore.
- firebase.js inicializa Firebase con las claves del proyecto.
- theme.js define la paleta y tipografía que usa Material UI.
- supabaseconfig/ concentra la configuración para hablar con Supabase Storage.

Buenas prácticas de organización:
Los componentes nuevos van en src/components con export default al final del archivo. Los estilos se guardan juntos y se importan dentro del componente. Para lógica compartida usa hooks o utils en lugar de duplicar código.

Requisitos previos:
- Node.js 18 o superior
- Proyecto Firebase con Auth y Firestore habilitados
- Proyecto Supabase con un bucket llamado news-images (lectura pública y subida solo para usuarios autenticados)

Variables de entorno:
Crea un archivo .env en la raíz con las siguientes claves (ajusta los valores):

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_BUCKET=news-images

Scripts principales:
- npm install para instalar dependencias
- npm run dev para arrancar en modo desarrollo (http://localhost:5173)
- npm run build para generar la versión de producción
- npm run preview para revisar el build localmente

Cómo funciona cada módulo clave:
1. Autenticación y roles: el registro pide correo, contraseña, nombre de usuario único y rol. Cada perfil vive en Firestore. ProtectedRoute se asegura de que nadie sin sesión acceda al dashboard.
2. Panel administrativo: AdminLayout arma el AppBar, el menú lateral y coloca el contenido de cada subruta. El menú cambia según el rol: reportero ve “Mis noticias” y “Crear noticia”; editor ve “Revisiones” y “Secciones”.
3. Noticias y estados: NewsForm crea o edita noticias, sube imágenes a Supabase y guarda los campos en Firestore. Los estados siguen el flujo Edición → Terminado → Publicado/Desactivado. Reporter marca “Terminado” y el editor decide publicar, desactivar o devolver a edición.
4. Notificaciones: useNotifications escucha la colección notificationStates filtrada por userId y devuelve la lista de avisos y la acción para marcarlos como leídos. NotificationBell muestra el número de pendientes y permite limpiarlos. Los reporteros reciben alertas cuando su noticia cambia de estado; los editores cuando hay novedades para revisar.
5. Sitio público: PublicLayout renderiza el header con categorías (sidebar en escritorio y panel móvil). Home agrupa noticias publicadas por sección y muestra un carrusel con las más recientes. Sections lista las noticias de la categoría, y NewsDetail despliega la nota completa.

Sugerencias de seguridad:
Cada vista del panel debería validar el rol por si alguien intenta entrar escribiendo la URL manualmente. También conviene reforzar las reglas de Firestore y Supabase para que solo el dueño de la noticia pueda editarla y solo los editores puedan cambiar el estado.

Despliegue recomendado:
1. Ejecuta npm run build.
2. Sube la carpeta dist/ a Vercel, Netlify u otro servicio.
3. Configura las variables de entorno en el panel del servicio con los valores de Firebase y Supabase.
4. Abre la app desplegada, inicia sesión como reportero y editor para validar los flujos.
5. Mantén el despliegue activo al menos una semana después de la entrega, tal como pide el requerimiento RNF-12.

Checklist rápido de pruebas antes de entregar:
- Crear cuenta de reportero, generar noticia con imagen y marcarla como “Terminado”.
- Verificar que el editor reciba la notificación, publique y desactive sin errores.
- Confirmar que la noticia publicada aparece en la portada y en su sección.
- Revisar la app en viewport móvil y de escritorio.
- Asegurarse de que cerrar sesión limpia el estado.

Ideas para seguir mejorando:
- Agregar pruebas con React Testing Library para formularios y flujos críticos.
- Afinar las reglas de seguridad en Firestore y Supabase.
- Ejecutar Lighthouse o similares para evaluar rendimiento y accesibilidad.

Esta guía la mantenemos entre todos. Si sumas nuevos flujos o cambias la arquitectura, actualiza el documento para que el siguiente desarrollador sepa por dónde empezar.
"# Entrega_Final_Web_Juan_Sapuy_Luis_Avenda-o" 
