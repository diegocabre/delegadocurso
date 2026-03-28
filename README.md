# 🎓 ClassTreasury - Panel de Tesorería Escolar

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Security-Server_Actions-FF4F4F?style=for-the-badge&logo=security" alt="Security" />
</p>

## 📖 Sobre el Proyecto

ClassTreasury es una plataforma web integral diseñada para digitalizar, organizar y transparentar la gestión financiera de cursos escolares y directivas. Permite a los apoderados visualizar en tiempo real los ingresos, egresos y saldos del curso, garantizando absoluta transparencia y facilidad de uso.

Originalmente desarrollado para el **Curso 5B**, esta herramienta a nivel de arquitectura escala perfectamente para ser implementada como un sistema **"White-Label" (marca blanca)** en cualquier colegio, centro de alumnos o directiva que requiera gestión abierta de fondos colectivos.

---

## 🚀 Características Principales

- **Dashboard Público de Transparencia:** Visualización instantánea de la caja actual, total recaudado y gastos históricos (sin necesidad de iniciar sesión para padres/apoderados).
- **🛡️ Panel Administrativo Blindado:** Zona protegida con _Proxy Node.js Edge_ y generación de cookies de sesión HTTPOnly para aislar la administración.
- **Módulo SaaS de Eventos y Campañas:** Gestión completamente separada para abonos extraordinarios (ej: Paseos, Pascua de Resurrección, etc.) sin que alteren el pozo de la cuota anual. Se habilitan metas dinámicas de recaudación.
- **Seguridad Backend (Server Actions):** Todas las validaciones de base de datos están protegidas en entornos backend aislados empleando _Roles de Servicio_. Nadie puede insertar datos desde el navegador por consola.
- **Gestor Fotográfico de Boletas:** Evidencia fotográfica estricta en la nube de cada movimiento. Los comprobantes se cargan directamente a Supabase Storage con soporte nativo para cámaras de smartphone.
- **Saldos en Tiempo Real:** Algoritmo veloz que calcula instantáneamente pagos pendientes y el registro histórico del año por alumno, integrando bases de datos en vivo (Supabase Realtime).
- **Diseño Mobile-First:** Experiencia limpia, colorida y fluida (basada en Tailwind CSS) construida en primer término para pantallas de celulares.

---

## 🛠️ Stack Tecnológico

- **Frontend:** [Next.js 16 (App Router)](https://nextjs.org/) + React 19
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Almacenamiento:** [Supabase](https://supabase.com/) (PostgreSQL + Buckets RLS)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Notificaciones UI:** [Sonner](https://sonner.emilkowal.ski/)
- **Iconografía:** [Lucide React](https://lucide.dev/)

---

## 📦 Despliegue e Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/diegocabre/delegadocurso.git
cd delegadocurso
```

### 2. Variables de Entorno
Crea un archivo local `.env.local` en la matriz de la carpeta y define estas 4 credenciales obligatorias:

| Variable | Descripción | Dónde encontrarla |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública para *lecturas* | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | **🗝️ CRÍTICO:** Llave maestra secreta para escrituras backend (Saltarse el RLS). | Supabase > Project Settings > API |
| `ADMIN_PASSWORD` | Contraseña global para la directiva (`/admin`). | *¡Invéntala tú mismo! (Ej. `Tesoreria2026`)* |

### 3. Configuración de Base de Datos (Supabase)
Prepara el entorno creando el Storage Bucket **"boletas"** y estas Tablas en SQL:
- `alumnos` (`id`, `nombre`, `apellido`)
- `pagos` (`id`, `alumno_id`, `monto`, `fecha`, `mes`, `comprobante_url`)
- `gastos` (`id`, `descripcion`, `categoria`, `monto`, `fecha`, `boleta_url`)
- `campanas` (`id`, `nombre`, `monto_objetivo`, `fecha_creacion`)
- `pagos_campanas` (`id`, `alumno_id`, `campana_id`, `monto`, `fecha`, `comprobante_url`)

> **⚠️ Alerta de Seguridad (Row Level Security):** Te recomendamos entrar al panel de Tablas de Supabase y **activar "Row Level Security (RLS)"** en TODAS las tablas. 
> Tu servidor backend ignorará el RLS para escribir usando el *Service Role Key*, pero **debes crear Políticas (Policies) públicas de LECTURA (`SELECT`)** a favor de todos los usuarios para que el dashboard pueda ser visto por los apoderados. Solo ejecuta `CREATE POLICY "Lectura" ON tabla FOR SELECT USING (true);` en el SQL Editor para cada tabla.

### 4. Iniciar Servidor de Desarrollo

```bash
npm install
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador preferido.

---

## 🌍 Producción Rápida (Recomendado)

Si venderás esto o lo distribuirás como "SaaS", **Vercel** es la opción ideal para clonar este repositorio docenas de veces:

1. Conecta este repositorio en tu cuenta de Vercel como un nuevo proyecto.
2. En la ventana emergente de despliegue, dirígete al acordeón de **Environment Variables** y pega estrictamente las 4 claves recién nombradas. Si omites la `SUPABASE_SERVICE_ROLE_KEY`, el guardado de recibos arrojará error *500*.
3. Presiona **Deploy**. Vercel se encargará de compilar las Edge Functions para el manejo seguro de inicio de sesión de la Directiva.

---

## 👥 Créditos del Origen

Arquitectado y validado en batallas para la **Directiva Escolar 2026**.
- **Delegado Principal:** Diego Cabré
- **Tesorería y Finanzas:** Macarena Carvajal
- **Backup Tecnológico:** Carlos Montenegro

> *Desarrollado con ❤️ para ser replicado y escalado.*
