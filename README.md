# 🤖 Worky AI - Plataforma de Reclutamiento Inteligente

<div align="center">

![Worky AI](https://img.shields.io/badge/Worky-AI-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

**Transforma tu proceso de contratación con IA de vanguardia**

[Características](#-características) • [Instalación](#-instalación) • [Configuración](#-configuración) • [Uso](#-uso) • [Documentación](#-documentación)

</div>

---

## 📖 Descripción

Worky AI es una plataforma completa de reclutamiento empresarial que utiliza inteligencia artificial para automatizar y optimizar el proceso de selección de personal. La plataforma permite a las empresas publicar ofertas de trabajo, recibir aplicaciones de candidatos, analizar CVs automáticamente, y gestionar todo el ciclo de selección desde un solo lugar.

### 🎯 ¿Qué resuelve Worky AI?

- **Automatización del proceso de selección**: Analiza y rankea candidatos automáticamente según los requerimientos del puesto
- **Ahorro de tiempo**: Reduce hasta un 90% del tiempo dedicado al screening de CVs
- **Matching inteligente**: Compara CVs con habilidades requeridas usando algoritmos avanzados de IA
- **Gestión integral**: Dashboard completo para gestionar ofertas, candidatos, entrevistas y reuniones
- **Experiencia bilingüe**: Interfaz disponible en español e inglés

---

## ✨ Características Principales

### 🧠 Inteligencia Artificial
- **Asistente de IA conversacional**: Interactúa en tiempo real para crear ofertas, analizar candidatos y responder preguntas
- **Ranking automático de candidatos**: Sistema de scoring basado en matching de habilidades y requerimientos
- **Resúmenes inteligentes**: Genera resúmenes automáticos de los mejores candidatos
- **Templates con IA**: Crea ofertas de trabajo rápidamente usando templates generados por IA

### 📊 Dashboard Empresarial
- **Vista general con estadísticas**: Métricas en tiempo real de ofertas, aplicantes y estados
- **Gestión de ofertas de trabajo**: Crea, edita, busca y gestiona múltiples ofertas
- **Tabla de candidatos avanzada**: Visualiza y filtra candidatos con ranking, estados y calificaciones
- **Perfil empresarial**: Gestiona información de la empresa con diseño moderno

### 📄 Gestión de CVs
- **Subida masiva**: Soporte para archivos PDF individuales o ZIP con múltiples CVs
- **Procesamiento automático**: Extracción automática de información de CVs mediante webhook
- **Visualización integrada**: Visualiza CVs directamente en el navegador sin descargas
- **Filtrado inteligente**: Solo muestra candidatos con CV completo

### 🎯 Sistema de Matching y Ranking
- **API de ranking integrada**: Compara candidatos con requerimientos de la oferta
- **Score de compatibilidad**: Calificación del 0-100% basada en habilidades, experiencia y educación
- **Ordenamiento automático**: Candidatos ordenados por mejor match
- **Visualización de scores**: Barras de progreso y badges de ranking

### 📅 Gestión de Entrevistas
- **Sección de reuniones**: Gestiona candidatos aprobados y agenda entrevistas
- **Integración con Google Meet**: Crea enlaces de reunión automáticamente (simulado actualmente)
- **Calendario visual**: Selector de fecha y hora con interfaz intuitiva
- **Gestión de entrevistadores**: Selecciona y visualiza quién realizará la entrevista
- **Timer en tiempo real**: Cronómetro para controlar la duración de las reuniones

### 🌐 Internacionalización
- **Soporte bilingüe**: Español e inglés con traducción completa de la interfaz
- **Cambio dinámico de idioma**: Toggle para cambiar entre idiomas en tiempo real
- **Traducción contextual**: Todos los textos de la aplicación están traducidos

### 🎨 Diseño Moderno
- **Interfaz glassmorphism**: Diseño moderno con efectos de vidrio y blur
- **Animaciones fluidas**: Transiciones suaves con Framer Motion
- **Responsive**: Diseño adaptable a todos los tamaños de pantalla
- **Lottie animations**: Animaciones vectoriales para mejor UX

---

## 🛠️ Tecnologías

### Frontend
- **Next.js 16.0** - Framework React con App Router
- **React 19.2** - Biblioteca UI
- **TypeScript 5.0** - Tipado estático
- **Framer Motion** - Animaciones fluidas
- **Tailwind CSS 4** - Estilos utilitarios
- **Lucide React** - Iconografía moderna
- **Lottie React** - Animaciones vectoriales

### Backend
- **Supabase** - Backend-as-a-Service (PostgreSQL + Storage + Auth)
- **Next.js API Routes** - Endpoints del servidor
- **Django** - Framework Python (backend de procesamiento)

### Integraciones
- **OpenAI GPT-4o-mini** - Modelo de lenguaje para el asistente de IA
- **Google Calendar API** - Gestión de reuniones (simulado actualmente)
- **Webhook externo** - Procesamiento de CVs (`https://riverz1357.app.n8n.cloud/webhook/cv-intake`)
- **API de Ranking** - Sistema de scoring (`https://hackathon-v3.onrender.com/api/ranking/`)

### Herramientas
- **JSZip** - Procesamiento de archivos ZIP
- **googleapis** - Cliente de Google APIs

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.0 o superior
- **npm** o **yarn** o **pnpm**
- **Git**
- Cuenta de **Supabase** (gratuita)
- API Key de **OpenAI** (opcional, para funcionalidades de IA)
- Credenciales de **Google Cloud** (opcional, para Google Meet)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/hackathon_v3.git
cd hackathon_v3
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la carpeta `frontend/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase

# OpenAI (Opcional - para asistente de IA)
OPENAI_KEY=tu_openai_api_key

# Google Calendar API (Opcional - para Google Meet)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REFRESH_TOKEN=tu_google_refresh_token

# Ranking API
RANKING_API_URL=https://hackathon-v3.onrender.com/api/ranking/

# Webhook para procesamiento de CVs
CV_WEBHOOK_URL=https://riverz1357.app.n8n.cloud/webhook/cv-intake
```

### 4. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta los scripts SQL necesarios en el SQL Editor de Supabase:
   - `frontend/supabase_setup.sql` - Configuración base
   - `frontend/fix_profile_rls.sql` - Políticas de seguridad
   - `frontend/create_interview_table.sql` - Tabla de entrevistas
   - `frontend/add_company_id_to_vacant.sql` - Columna de empresa (opcional)

3. Configura el Storage Bucket para CVs:
   - Crea un bucket llamado `cvs`
   - Configura las políticas RLS necesarias

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚙️ Configuración Detallada

### Configuración de Supabase

Consulta `frontend/SUPABASE_SETUP.md` para instrucciones detalladas sobre la configuración de la base de datos.

### Configuración de OpenAI

1. Obtén tu API Key en [OpenAI Platform](https://platform.openai.com/api-keys)
2. Agrégala al archivo `.env.local`
3. Sin esta clave, el asistente de IA funcionará con respuestas predefinidas

### Configuración de Google Calendar/Meet

Para habilitar la integración con Google Meet (actualmente en modo simulado):

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilita Google Calendar API
3. Crea credenciales OAuth 2.0
4. Obtén un Refresh Token siguiendo las instrucciones en `frontend/GET_GOOGLE_REFRESH_TOKEN.md`
5. Agrégala al archivo `.env.local`

> **Nota**: Actualmente la aplicación funciona en modo simulado para Google Meet hasta completar la verificación de Google.

---

## 🎯 Uso

### Para Empresas

1. **Registro**: Crea una cuenta empresarial en `/signup/enterprise`
2. **Perfil**: Completa el perfil de tu empresa en el dashboard
3. **Crear Ofertas**: Usa el asistente de IA o el formulario para crear ofertas de trabajo
4. **Gestionar Candidatos**: Revisa candidatos, cambia estados (aprobado/rechazado/pendiente)
5. **Rankear**: Los candidatos se rankean automáticamente según su compatibilidad
6. **Entrevistas**: Agenda reuniones con candidatos aprobados

### Para Candidatos

1. **Registro**: Regístrate como usuario en `/signup/user`
2. **Subir CV**: Sube tu CV en formato PDF
3. **Aplicar**: Usa el ID de la oferta para aplicar vía WhatsApp
4. **Esperar**: Las empresas revisarán tu perfil y te contactarán

### Características del Asistente de IA

El asistente de IA puede ayudarte con:
- ✅ Crear ofertas de trabajo interactivamente
- ✅ Analizar estadísticas de candidatos
- ✅ Responder preguntas sobre el proceso de selección
- ✅ Navegar por la aplicación
- ✅ Proporcionar insights sobre tus ofertas

---

## 📁 Estructura del Proyecto

```
hackathon_v3/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # App Router de Next.js
│   │   │   ├── api/         # API Routes
│   │   │   ├── dashboard/   # Página del dashboard
│   │   │   ├── login/       # Páginas de autenticación
│   │   │   └── signup/      # Páginas de registro
│   │   ├── components/      # Componentes React
│   │   │   ├── dashboard/   # Componentes del dashboard
│   │   │   ├── auth/        # Componentes de autenticación
│   │   │   ├── sections/    # Secciones de la landing
│   │   │   └── layout/      # Componentes de layout
│   │   ├── contexts/        # React Contexts
│   │   └── lib/             # Utilidades y helpers
│   ├── public/              # Archivos estáticos
│   └── *.sql               # Scripts de migración SQL
├── backend/                 # Backend Django (opcional)
│   └── worky/
│       └── WorkyApp/
│           └── core/        # App principal Django
└── ETL/                     # Scripts de extracción de datos
```

---

## 🔌 API Endpoints

### Frontend API Routes (`/api/*`)

- `POST /api/ai-assistant` - Asistente de IA conversacional
- `POST /api/ai-chat` - Chat de IA para análisis de candidatos
- `POST /api/upload-cvs` - Subida y procesamiento de CVs
- `POST /api/applicants/update-status` - Actualizar estado de candidato
- `POST /api/create-meeting` - Crear reunión de Google Meet
- `POST /api/interviews/create` - Crear entrevista
- `POST /api/interviews/update-status` - Actualizar estado de entrevista

### APIs Externas

- `POST https://hackathon-v3.onrender.com/api/ranking/` - Ranking de candidatos
  - Body: `{ "vacant_id": number, "limit": number }`
  - Response: `{ "answer": string, "matches": Array<{ id: string, score: number }> }`

- `POST https://riverz1357.app.n8n.cloud/webhook/cv-intake` - Procesamiento de CVs
  - Body: `{ "vacant_id": number, "file_name": string, "file_mime": string, "file_base64": string, "source": string }`
  - Response: `{ "ok": boolean, "profile_id": number, "cv_url": string, "status": string }`

---

## 🎨 Características de Diseño

- **Glassmorphism**: Efectos de vidrio esmerilado y blur
- **Gradientes modernos**: Colores vibrantes y profesionales
- **Animaciones fluidas**: Transiciones suaves con Framer Motion
- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Dark Mode Ready**: Preparado para modo oscuro (pendiente de activación)
- **Accesibilidad**: Componentes accesibles y semánticos

---

## 🌍 Internacionalización

La aplicación soporta dos idiomas:
- 🇪🇸 **Español** (por defecto)
- 🇺🇸 **Inglés**

El cambio de idioma se realiza mediante el toggle en la interfaz. Todos los textos están centralizados en `src/contexts/TranslationContext.tsx`.

---

## 🔒 Seguridad

- **Row Level Security (RLS)**: Políticas de seguridad en Supabase
- **Autenticación**: Sistema de autenticación seguro con Supabase Auth
- **Validación**: Validación de datos tanto en cliente como servidor
- **HTTPS**: Todas las comunicaciones son seguras
- **Sanitización**: Los inputs del usuario son sanitizados

---

## 📊 Base de Datos

### Tablas Principales

- `company` - Información de empresas
- `company_contact_info` - Contacto de empresas
- `vacant` - Ofertas de trabajo
- `profile` - Perfiles de candidatos
- `interview` - Entrevistas programadas
- `profile_match` - Resultados de matching (si se implementa)

### Esquema de Datos

```sql
vacant
├── id (PK)
├── name
├── role
├── salary
├── description
├── availability (remote/hybrid/on_site)
├── location
├── required_skills (JSONB) - Array de {name, importance, must_have}
└── created_at

profile
├── id (PK)
├── personal_information (JSONB)
├── experience (JSONB)
├── education (JSONB)
├── skills (JSONB)
├── vacant_id (FK)
├── status (pending/approved/rejected)
├── cv_url
└── created_at

interview
├── id (PK)
├── profile_id (FK)
├── vacant_id (FK)
├── status
├── scheduled_at
├── proposed_slots (JSONB)
├── meeting_url
└── notes
```

---

## 🧪 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación
npm run start        # Inicia servidor de producción

# Linting
npm run lint         # Ejecuta ESLint
```

### Estructura de Componentes

Los componentes están organizados por funcionalidad:
- `dashboard/` - Componentes del dashboard empresarial
- `auth/` - Componentes de autenticación y registro
- `sections/` - Secciones de la landing page
- `layout/` - Componentes de layout (header, footer, sidebar)

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to Supabase"
- Verifica que las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctamente configuradas
- Asegúrate de que tu proyecto de Supabase esté activo

### Error: "OPENAI_KEY is not configured"
- El asistente funcionará con respuestas predefinidas
- Para habilitar IA completa, agrega tu API key de OpenAI

### Error: "redirect_uri_mismatch" (Google OAuth)
- Verifica que `https://developers.google.com/oauthplayground` esté en las URIs autorizadas
- Consulta `frontend/FIX_REDIRECT_URI_ERROR.md` para más detalles

### Los candidatos no aparecen
- Verifica que los perfiles tengan `cv_url` configurado
- Asegúrate de que el `vacant_id` coincida con la oferta

---

## 🤝 Contribución

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

---

## 👥 Autores

- **Equipo Worky AI** - Desarrollo inicial

---

## 🙏 Agradecimientos

- Supabase por el excelente BaaS
- OpenAI por las APIs de IA
- La comunidad de Next.js y React
- Todos los colaboradores del proyecto

---

## 📞 Soporte

Para soporte, envía un email a contact@workyai.com o abre un issue en GitHub.

---

<div align="center">

**Hecho con ❤️ por el equipo de Worky AI**

⭐ Si este proyecto te resultó útil, considera darle una estrella

</div>
