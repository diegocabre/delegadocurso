# 📊 Sistema de Tesorería - Curso 5B (2026)

Este es un panel de gestión financiera diseñado para digitalizar y transparentar los fondos del curso **5B**. Permite el registro de aportes (pagos de cuotas) por parte de la directiva y la visualización de gastos e ingresos en tiempo real para todos los apoderados.

---

## 🚀 Características Principales

- **Dashboard de Transparencia:** Visualización de ingresos (aportes) y egresos (gastos) con cálculo automático de saldo actual.
- **Actualizaciones en Tiempo Real:** Integración con _Supabase Realtime_ para que los cambios se reflejen instantáneamente sin recargar la página.
- **Panel Administrativo:** Sección protegida para el registro de nuevos movimientos.
- **Gestión de Comprobantes:** Soporte para subir fotos de boletas y comprobantes de transferencia directamente desde el móvil.
- **Diseño Mobile-First:** Optimizado para que los apoderados lo consulten desde sus smartphones.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos & Auth:** [Supabase](https://supabase.com/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Componentes UI:** Shadcn/ui (Radix UI)

## 📦 Instalación y Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/tu-usuario/tesoreria-5b.git](https://github.com/tu-usuario/tesoreria-5b.git)
    cd tesoreria-5b
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz y añade tus credenciales de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
    ```

4.  **Correr en desarrollo:**
    ```bash
    npm run dev
    ```

## 🏗️ Estructura del Proyecto

- `/app`: Rutas de Next.js (Dashboard, Admin, Login).
- `/components`: Componentes reutilizables (Modales, Tablas, Stats).
- `/lib`: Configuración de clientes (Supabase, utilidades).
- `/public`: Assets estáticos y logos del curso.

## 🛡️ Configuración de Base de Datos (Supabase)

Para que el **Realtime** funcione correctamente, asegúrate de activar la replicación en el panel de Supabase:

1. Ve a **Database** -> **Replication**.
2. Habilita las tablas `pagos` y `gastos` en la publicación `supabase_realtime`.

## 👥 Directiva 2026

- **Delegado:** Diego Cabré
- **Tesorería:** Macarena Carvajal
- **Tesorería BackUp:** Carlos Montenegro

---

Desarrollado con ❤️ para el 5B.
