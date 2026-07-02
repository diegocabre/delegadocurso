const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Leer archivo .env.local de la carpeta anterior (dasboard)
const envPath = path.join(__dirname, "..", ".env.local");
let supabaseUrl = "";
let serviceRoleKey = "";

try {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = line.split("=")[1].trim();
    }
    if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = line.split("=")[1].trim();
    }
  }
} catch (e) {
  console.error("Error leyendo archivo .env.local:", e.message);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log("Iniciando carga de datos DEMO-2026...");

  // 2. Limpiar datos viejos de la demo para poder re-ejecutar limpio
  const { data: oldCurso } = await supabase
    .from("cursos")
    .select("id")
    .eq("codigo", "DEMO-2026")
    .maybeSingle();

  if (oldCurso) {
    console.log("Limpiando datos demo antiguos...");
    await supabase.from("cursos").delete().eq("id", oldCurso.id);
  }

  // 3. Crear el curso DEMO-2026
  console.log("Creando curso DEMO-2026...");
  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .insert([
      {
        codigo: "DEMO-2026",
        nombre: "Curso Demo 5ºA",
        admin_password: "demo",
        activo: true,
      },
    ])
    .select()
    .single();

  if (cursoError || !curso) {
    console.error("Error creando curso demo:", cursoError?.message);
    return;
  }

  const cId = curso.id;

  // 4. Crear alumnos de prueba
  console.log("Insertando alumnos demo...");
  const { data: alumnos, error: alError } = await supabase
    .from("alumnos")
    .insert([
      { curso_id: cId, nombre: "Martín", apellido: "Jara", activo: true },
      { curso_id: cId, nombre: "Sofía", apellido: "Valenzuela", activo: true },
      { curso_id: cId, nombre: "Benjamín", apellido: "Muñoz", activo: true },
      { curso_id: cId, nombre: "Camila", apellido: "Tapia", activo: true },
      { curso_id: cId, nombre: "Tomás", apellido: "Castro", activo: true },
    ])
    .select();

  if (alError || !alumnos) {
    console.error("Error creando alumnos demo:", alError?.message);
    return;
  }

  const jara = alumnos.find(a => a.nombre === "Martín").id;
  const valenzuela = alumnos.find(a => a.nombre === "Sofía").id;
  const munoz = alumnos.find(a => a.nombre === "Benjamín").id;
  const tapia = alumnos.find(a => a.nombre === "Camila").id;
  const castro = alumnos.find(a => a.nombre === "Tomás").id;

  // 5. Insertar aportes (pagos cuota anual)
  console.log("Insertando aportes demo...");
  await supabase.from("pagos").insert([
    {
      curso_id: cId,
      alumno_id: jara,
      monto: 5000,
      mes: "Cuota de Marzo",
      fecha: "2026-03-05",
      comprobante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    },
    {
      curso_id: cId,
      alumno_id: valenzuela,
      monto: 5000,
      mes: "Cuota de Marzo",
      fecha: "2026-03-06",
      comprobante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    },
    {
      curso_id: cId,
      alumno_id: munoz,
      monto: 5000,
      mes: "Cuota de Marzo",
      fecha: "2026-03-07",
    },
    {
      curso_id: cId,
      alumno_id: tapia,
      monto: 5000,
      mes: "Cuota de Marzo",
      fecha: "2026-03-08",
      comprobante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    },
    {
      curso_id: cId,
      alumno_id: jara,
      monto: 5000,
      mes: "Cuota de Abril",
      fecha: "2026-04-05",
    },
    {
      curso_id: cId,
      alumno_id: valenzuela,
      monto: 5000,
      mes: "Cuota de Abril",
      fecha: "2026-04-06",
    },
  ]);

  // 6. Insertar egresos (gastos)
  console.log("Insertando gastos demo...");
  await supabase.from("gastos").insert([
    {
      curso_id: cId,
      monto: 8500,
      descripcion: "Útiles de aseo y papelería sala de clases",
      categoria: "Librería / Materiales",
      fecha: "2026-03-12",
      boleta_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    },
    {
      curso_id: cId,
      monto: 12000,
      descripcion: "Flores y globos decoración Día de la Madre",
      categoria: "Eventos",
      fecha: "2026-05-08",
      boleta_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    },
  ]);

  // 7. Insertar campañas especiales
  console.log("Insertando campañas demo...");
  const { data: campana, error: campError } = await supabase
    .from("campanas")
    .insert([
      {
        curso_id: cId,
        nombre: "Paseo de Invierno a Fantasilandia",
        monto_objetivo: 15000,
        estado: "activa",
        imagen_url: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&auto=format&fit=crop",
      },
    ])
    .select()
    .single();

  if (campError || !campana) {
    console.error("Error creando campaña demo:", campError?.message);
    return;
  }

  // 8. Insertar aportes a campaña
  console.log("Insertando pagos de campaña demo...");
  await supabase.from("pagos_campanas").insert([
    {
      curso_id: cId,
      alumno_id: jara,
      campana_id: campana.id,
      monto: 15000,
      fecha: "2026-06-01",
      comprobante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
    },
    {
      curso_id: cId,
      alumno_id: valenzuela,
      campana_id: campana.id,
      monto: 15000,
      fecha: "2026-06-02",
    },
    {
      curso_id: cId,
      alumno_id: tapia,
      campana_id: campana.id,
      monto: 10000, // Abono parcial
      fecha: "2026-06-03",
    },
  ]);

  console.log("¡Carga DEMO-2026 finalizada exitosamente!");
}

run();
