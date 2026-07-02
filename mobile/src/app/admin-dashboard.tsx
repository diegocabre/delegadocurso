import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Calendar,
  Camera,
  Coins,
  LogOut,
  PartyPopper,
  Plus,
  Receipt,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function AdminDashboardScreen() {
  const [cursoId, setCursoId] = useState<string | null>(null);
  const [cursoCodigo, setCursoCodigo] = useState("");
  const [cursoNombre, setCursoNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [cursoActivo, setCursoActivo] = useState(true);

  // Datos financieros
  const [saldo, setSaldo] = useState(0);
  const [ingresos, setIngresos] = useState(0);
  const [gastos, setGastos] = useState(0);

  const [listaGastos, setListaGastos] = useState<any[]>([]);
  const [listaPagos, setListaPagos] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [campanas, setCampanas] = useState<any[]>([]);
  const [pagosCampanas, setPagosCampanas] = useState<any[]>([]);

  // Navegación / UI
  const [activeTab, setActiveTab] = useState<"aportes" | "egresos" | "alumnos">("aportes");
  const [filtroAlumno, setFiltroAlumno] = useState("");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // --- MODALS STATES ---
  const [modalGasto, setModalGasto] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [modalAlumno, setModalAlumno] = useState(false);
  const [modalCampana, setModalCampana] = useState(false);
  const [modalPagoCampana, setModalPagoCampana] = useState(false);
  const [modalPagarCaja, setModalPagarCaja] = useState(false);

  // --- FORMS STATES ---
  const [gValue, setGValue] = useState("");
  const [gDesc, setGDesc] = useState("");
  const [gCat, setGCat] = useState("Varios");
  const [gImg, setGImg] = useState<string | null>(null);

  const [pVal, setPVal] = useState("");
  const [pAlumnoId, setPAlumnoId] = useState("");
  const [pMes, setPMes] = useState("Abono a cuenta anual");
  const [pImg, setPImg] = useState<string | null>(null);

  const [aNom, setANom] = useState("");
  const [aApe, setAApe] = useState("");

  const [cNom, setCNom] = useState("");
  const [cMeta, setCMeta] = useState("");
  const [cImg, setCImg] = useState<string | null>(null);

  const [pcVal, setPcVal] = useState("");
  const [pcAlumnoId, setPcAlumnoId] = useState("");
  const [pcCampanaId, setPcCampanaId] = useState("");
  const [pcImg, setPcImg] = useState<string | null>(null);

  const [pccCampanaId, setPccCampanaId] = useState("");
  const [pccNombreCampana, setPccNombreCampana] = useState("");
  const [pccVal, setPccVal] = useState("");
  const [pccImg, setPccImg] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  // Cargar sesión inicial
  useEffect(() => {
    const loadSession = async () => {
      const id = await AsyncStorage.getItem("curso_id");
      const code = await AsyncStorage.getItem("curso_codigo");
      const nombre = await AsyncStorage.getItem("curso_nombre");
      const admin = await AsyncStorage.getItem("admin_logged_in");

      if (id && code && nombre && admin === "true") {
        setCursoId(id);
        setCursoCodigo(code);
        setCursoNombre(nombre);
      } else {
        router.replace("/");
      }
    };
    loadSession();
  }, []);

  // Fetch de información
  const fetchDashboardData = useCallback(async (id: string) => {
    try {
      // Consultar estado de activación del curso
      const { data: cursoData } = await supabase
        .from("cursos")
        .select("activo")
        .eq("id", id)
        .single();

      if (cursoData) {
        setCursoActivo(cursoData.activo);
      }

      const { data: g } = await supabase
        .from("gastos")
        .select("*")
        .eq("curso_id", id)
        .order("fecha", { ascending: false });

      const { data: p } = await supabase
        .from("pagos")
        .select(`id, monto, mes, fecha, comprobante_url, alumnos(id, nombre, apellido)`)
        .eq("curso_id", id)
        .order("fecha", { ascending: false });

      const { data: al } = await supabase
        .from("alumnos")
        .select("*")
        .eq("curso_id", id)
        .eq("activo", true)
        .order("apellido");

      const { data: c } = await supabase
        .from("campanas")
        .select("*")
        .eq("curso_id", id)
        .order("fecha_creacion", { ascending: false });

      const { data: pc } = await supabase
        .from("pagos_campanas")
        .select(`id, monto, campana_id, alumnos (id, nombre, apellido), campanas(nombre)`)
        .eq("curso_id", id)
        .order("fecha", { ascending: false });

      let totalIn = 0;
      let totalOut = 0;

      if (p) {
        setListaPagos(p);
        totalIn = p.reduce((acc, curr) => acc + curr.monto, 0);
      }
      if (g) {
        setListaGastos(g);
        totalOut = g.reduce((acc, curr) => acc + curr.monto, 0);
      }
      if (al) setAlumnos(al);
      if (c) setCampanas(c);
      if (pc) setPagosCampanas(pc);

      setIngresos(totalIn);
      setGastos(totalOut);
      setSaldo(totalIn - totalOut);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cursoId) return;

    fetchDashboardData(cursoId);

    // Suscribirse en tiempo real
    const channel = supabase
      .channel("mobile_admin_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gastos", filter: `curso_id=eq.${cursoId}` },
        () => fetchDashboardData(cursoId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pagos", filter: `curso_id=eq.${cursoId}` },
        () => fetchDashboardData(cursoId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alumnos", filter: `curso_id=eq.${cursoId}` },
        () => fetchDashboardData(cursoId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campanas", filter: `curso_id=eq.${cursoId}` },
        () => fetchDashboardData(cursoId)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pagos_campanas", filter: `curso_id=eq.${cursoId}` },
        () => fetchDashboardData(cursoId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cursoId, fetchDashboardData]);

  const handleExit = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  // --- CAMERA & PHOTO HELPERS ---
  const takePhoto = async (setPhotoUri: (uri: string | null) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso Denegado",
        "Se necesita acceso a la cámara para tomar fotos de las boletas."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (localUri: string, folder: string): Promise<string | null> => {
    if (!localUri) return null;
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();

      const fileExt = localUri.split(".").pop() || "jpg";
      const fileName = `${folder}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from("boletas")
        .upload(filePath, blob, {
          contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("boletas").getPublicUrl(filePath);

      return publicUrl;
    } catch (e: any) {
      console.error("Upload error:", e);
      Alert.alert("Error de Carga", "No se pudo subir la imagen del comprobante.");
      return null;
    }
  };

  // --- CRUD ACTIONS ---
  const handleAddAlumno = async () => {
    if (!aNom.trim() || !aApe.trim()) {
      Alert.alert("Atención", "Escribe el nombre y apellido.");
      return;
    }
    setUploading(true);
    try {
      const { error } = await supabase.from("alumnos").insert([
        {
          curso_id: cursoId,
          nombre: aNom.trim(),
          apellido: aApe.trim(),
          activo: true,
        },
      ]);
      if (error) throw error;
      setModalAlumno(false);
      setANom("");
      setAApe("");
      Alert.alert("Éxito", "Alumno registrado correctamente.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddGasto = async () => {
    if (!gValue || !gDesc.trim()) {
      Alert.alert("Atención", "Completa la descripción y el monto.");
      return;
    }
    setUploading(true);
    try {
      let boletaUrl = null;
      if (gImg) {
        boletaUrl = await uploadPhoto(gImg, "gastos");
      }

      const { error } = await supabase.from("gastos").insert([
        {
          curso_id: cursoId,
          monto: parseInt(gValue),
          descripcion: gDesc.trim(),
          categoria: gCat,
          fecha: new Date().toISOString().split("T")[0],
          boleta_url: boletaUrl,
        },
      ]);
      if (error) throw error;
      setModalGasto(false);
      setGValue("");
      setGDesc("");
      setGCat("Varios");
      setGImg(null);
      Alert.alert("Éxito", "Gasto registrado correctamente.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddPago = async () => {
    if (!pVal || !pAlumnoId) {
      Alert.alert("Atención", "Selecciona un alumno e ingresa el monto.");
      return;
    }
    setUploading(true);
    try {
      let comprobanteUrl = null;
      if (pImg) {
        comprobanteUrl = await uploadPhoto(pImg, "pagos");
      }

      const { error } = await supabase.from("pagos").insert([
        {
          curso_id: cursoId,
          alumno_id: pAlumnoId,
          monto: parseInt(pVal),
          mes: pMes,
          fecha: new Date().toISOString().split("T")[0],
          comprobante_url: comprobanteUrl,
        },
      ]);
      if (error) throw error;
      setModalPago(false);
      setPVal("");
      setPAlumnoId("");
      setPMes("Abono a cuenta anual");
      setPImg(null);
      Alert.alert("Éxito", "Aporte registrado correctamente.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCampana = async () => {
    if (!cNom.trim() || !cMeta) {
      Alert.alert("Atención", "Ingresa el nombre y costo objetivo.");
      return;
    }
    setUploading(true);
    try {
      let imagenUrl = null;
      if (cImg) {
        imagenUrl = await uploadPhoto(cImg, "campanas");
      }

      const { error } = await supabase.from("campanas").insert([
        {
          curso_id: cursoId,
          nombre: cNom.trim(),
          monto_objetivo: parseInt(cMeta),
          imagen_url: imagenUrl,
          estado: "activa",
        },
      ]);
      if (error) throw error;
      setModalCampana(false);
      setCNom("");
      setCMeta("");
      setCImg(null);
      Alert.alert("Éxito", "Campaña creada correctamente.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddPagoCampana = async () => {
    if (!pcVal || !pcAlumnoId || !pcCampanaId) {
      Alert.alert("Atención", "Completa todos los campos obligatorios.");
      return;
    }
    setUploading(true);
    try {
      let comprobanteUrl = null;
      if (pcImg) {
        comprobanteUrl = await uploadPhoto(pcImg, "campanas");
      }

      const { error } = await supabase.from("pagos_campanas").insert([
        {
          curso_id: cursoId,
          alumno_id: pcAlumnoId,
          campana_id: pcCampanaId,
          monto: parseInt(pcVal),
          fecha: new Date().toISOString().split("T")[0],
          comprobante_url: comprobanteUrl,
        },
      ]);
      if (error) throw error;
      setModalPagoCampana(false);
      setPcVal("");
      setPcAlumnoId("");
      setPcCampanaId("");
      setPcImg(null);
      Alert.alert("Éxito", "Aporte de campaña registrado.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePagarCampanaCaja = async () => {
    if (!pccCampanaId || !pccVal) {
      Alert.alert("Atención", "Completa los campos.");
      return;
    }
    setUploading(true);
    try {
      let boletaUrl = null;
      if (pccImg) {
        boletaUrl = await uploadPhoto(pccImg, "gastos");
      }

      // 1. Insertar el Egreso (Gasto) debitando
      const { error: gastoError } = await supabase.from("gastos").insert([
        {
          curso_id: cursoId,
          monto: parseInt(pccVal),
          descripcion: `Pago evento (Fondo Central): ${pccNombreCampana}`,
          categoria: "Eventos",
          fecha: new Date().toISOString().split("T")[0],
          boleta_url: boletaUrl,
        },
      ]);

      if (gastoError) throw gastoError;

      // 2. Marcar campaña como finalizada/realizada
      const { error: campanaError } = await supabase
        .from("campanas")
        .update({ estado: "realizada" })
        .eq("id", pccCampanaId);

      if (campanaError) throw campanaError;

      setModalPagarCaja(false);
      setPccCampanaId("");
      setPccNombreCampana("");
      setPccVal("");
      setPccImg(null);
      Alert.alert("Éxito", "Campaña pagada desde el fondo central.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = (table: string, id: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que quieres eliminar este registro de forma permanente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from(table).delete().eq("id", id);
              if (error) throw error;
              Alert.alert("Eliminado", "Registro borrado correctamente.");
            } catch (e: any) {
              Alert.alert("Error", "No se pudo borrar el registro.");
            }
          },
        },
      ]
    );
  };

  const handleDeactivateAlumno = (id: string, name: string) => {
    Alert.alert(
      "Confirmar Desactivación",
      `¿Quieres quitar a ${name} de los alumnos activos del curso?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("alumnos")
                .update({ activo: false })
                .eq("id", id);
              if (error) throw error;
              Alert.alert("Completado", "El integrante ya no figura como activo.");
            } catch (e: any) {
              Alert.alert("Error", "No se pudo desactivar.");
            }
          },
        },
      ]
    );
  };

  // Filtrados
  const pagosFiltrados = listaPagos.filter((p) => {
    if (!p.alumnos) return false;
    const nombreCompleto =
      `${p.alumnos.nombre} ${p.alumnos.apellido}`.toLowerCase();
    return nombreCompleto.includes(filtroAlumno.toLowerCase());
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Cargando panel de directiva...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#0F172A", "#064E3B"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.cursoNombre}>{cursoNombre} 👑</Text>
            <Text style={styles.cursoCodigo}>Modo Administrador (Código: {cursoCodigo})</Text>
          </View>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <LogOut size={18} color="#FDA4AF" />
          </TouchableOpacity>
        </View>

        {/* Banner Informativo de Demo */}
        {cursoCodigo === "DEMO-2026" && (
          <View style={styles.demoBanner}>
            <View style={styles.demoBannerContent}>
              <View style={styles.demoBannerTextGroup}>
                <Text style={styles.demoBannerTitle}>🧪 Modo Demo: Vista Directiva</Text>
                <Text style={styles.demoBannerDesc}>
                  Estás viendo el panel de gestión. Agrega un alumno, registra un gasto/aporte, o usa tu cámara para probar la subida de comprobantes en vivo.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.replace("/parent-dashboard")}
                style={styles.demoSwitchButton}
              >
                <Text style={styles.demoSwitchButtonText}>Probar Apoderado 👥</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Banner de Activación Pendiente */}
        {!cursoActivo && (
          <View style={styles.activationBanner}>
            <Text style={styles.activationBannerTitle}>⚠️ CURSO PENDIENTE DE ACTIVACIÓN</Text>
            <Text style={styles.activationBannerText}>
              Para activar este curso por el año escolar (hasta Diciembre 2026) y permitir que los apoderados puedan ingresar con el código "{cursoCodigo}", realiza la transferencia anual de $12.000 CLP.
            </Text>
            <Text style={styles.activationBannerDetails}>
              Banco Estado | Cuenta RUT | Nº 12345678 | Rut 12.345.678-9 | pagos@classtreasury.com
            </Text>
            <TouchableOpacity
              onPress={() => {
                const text = `Hola! Acabo de registrar el curso "${cursoNombre}" (Código: ${cursoCodigo}) en ClassTreasury. Envío el comprobante para activarlo.`;
                const url = `https://wa.me/56947637541?text=${encodeURIComponent(text)}`;
                Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
              }}
              style={styles.activationBannerBtn}
            >
              <Text style={styles.activationBannerBtnText}>Enviar Comprobante por WhatsApp 💬</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Resumen Financiero */}
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Saldo Caja del Curso</Text>
          <Text style={styles.saldoText}>${saldo.toLocaleString("es-CL")}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={styles.statValueGreen}>
                +${ingresos.toLocaleString("es-CL")}
              </Text>
            </View>
            <View style={styles.statColumn}>
              <TrendingDown size={14} color="#FDA4AF" />
              <Text style={styles.statValueRed}>
                -${gastos.toLocaleString("es-CL")}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.actionsPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
            <TouchableOpacity onPress={() => setModalPago(true)} style={[styles.actionBtn, { backgroundColor: "#047857" }]}>
              <Coins size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Aporte Cuota</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalGasto(true)} style={[styles.actionBtn, { backgroundColor: "#B91C1C" }]}>
              <Receipt size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Registrar Gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalAlumno(true)} style={[styles.actionBtn, { backgroundColor: "#2563EB" }]}>
              <UserPlus size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Nuevo Alumno</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalCampana(true)} style={[styles.actionBtn, { backgroundColor: "#7C3AED" }]}>
              <PartyPopper size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Nueva Campaña</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalPagoCampana(true)} style={[styles.actionBtn, { backgroundColor: "#C2410C" }]}>
              <Coins size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Aporte Campaña</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lista de Campañas para Pagar desde Caja */}
        {campanas.filter(c => c.estado !== "realizada").length > 0 && (
          <View style={styles.pendingCampanasSection}>
            <Text style={styles.sectionTitle}>Campañas Activas (Pagar desde Caja)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pendingCampanasRow}>
              {campanas.filter(c => c.estado !== "realizada").map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.pendingCampanaBadge}
                  onPress={() => {
                    setPccCampanaId(c.id);
                    setPccNombreCampana(c.nombre);
                    setModalPagarCaja(true);
                  }}
                >
                  <Text style={styles.pendingCampanaBadgeText}>{c.nombre}</Text>
                  <Plus size={12} color="#fff" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "aportes" && styles.activeTab]}
            onPress={() => setActiveTab("aportes")}
          >
            <Text style={[styles.tabText, activeTab === "aportes" && styles.activeTabText]}>Aportes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "egresos" && styles.activeTab]}
            onPress={() => setActiveTab("egresos")}
          >
            <Text style={[styles.tabText, activeTab === "egresos" && styles.activeTabText]}>Egresos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "alumnos" && styles.activeTab]}
            onPress={() => setActiveTab("alumnos")}
          >
            <Text style={[styles.tabText, activeTab === "alumnos" && styles.activeTabText]}>Integrantes</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "aportes" && (
          <View style={styles.listSection}>
            <View style={styles.searchContainer}>
              <Search size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar aporte..."
                placeholderTextColor="#64748B"
                value={filtroAlumno}
                onChangeText={setFiltroAlumno}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={pagosFiltrados}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <View>
                      <Text style={styles.itemTitle}>{item.alumnos?.apellido} {item.alumnos?.nombre}</Text>
                      <Text style={styles.itemSub}>{item.mes} | {new Date(item.fecha).toLocaleDateString("es-CL")}</Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={styles.itemValueGreen}>+${item.monto.toLocaleString("es-CL")}</Text>
                    {item.comprobante_url && (
                      <TouchableOpacity onPress={() => setSelectedImg(item.comprobante_url)} style={styles.receiptIconBtn}>
                        <Receipt size={14} color="#10B981" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteItem("pagos", item.id)} style={styles.deleteIconBtn}>
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === "egresos" && (
          <View style={styles.listSection}>
            <FlatList
              data={listaGastos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <View>
                      <Text style={styles.itemTitle}>{item.descripcion}</Text>
                      <Text style={styles.itemSub}>{new Date(item.fecha).toLocaleDateString("es-CL")} | {item.categoria}</Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={styles.itemValueRed}>-${item.monto.toLocaleString("es-CL")}</Text>
                    {item.boleta_url && (
                      <TouchableOpacity onPress={() => setSelectedImg(item.boleta_url)} style={styles.receiptIconBtnRed}>
                        <Receipt size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteItem("gastos", item.id)} style={styles.deleteIconBtn}>
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === "alumnos" && (
          <View style={styles.listSection}>
            <FlatList
              data={alumnos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Users size={16} color="#3B82F6" style={{ marginRight: 8 }} />
                    <Text style={styles.itemTitle}>{item.apellido} {item.nombre}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeactivateAlumno(item.id, `${item.nombre} ${item.apellido}`)} style={styles.deactivateBtn}>
                    <Text style={styles.deactivateBtnText}>Desactivar</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* --- MODAL REGISTRAR PAGO --- */}
        <Modal visible={modalPago} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Registrar Aporte Cuota</Text>
                <TouchableOpacity onPress={() => setModalPago(false)}><X size={20} color="#fff" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={styles.modalLabel}>Alumno/a</Text>
                <View style={styles.pickerReplacement}>
                  <ScrollView style={{ maxHeight: 120 }}>
                    {alumnos.map(a => (
                      <TouchableOpacity
                        key={a.id}
                        style={[styles.pickerItem, pAlumnoId === a.id && styles.pickerItemSel]}
                        onPress={() => setPAlumnoId(a.id)}
                      >
                        <Text style={[styles.pickerItemText, pAlumnoId === a.id && styles.pickerItemTextSel]}>{a.apellido} {a.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.modalLabel}>Monto ($)</Text>
                <TextInput style={styles.modalInput} keyboardType="numeric" value={pVal} onChangeText={setPVal} placeholder="Ej: 5000" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Descripción / Detalle</Text>
                <TextInput style={styles.modalInput} value={pMes} onChangeText={setPMes} placeholder="Ej: Pago de cuota Mayo" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Comprobante de Transferencia</Text>
                <View style={styles.photoContainer}>
                  {pImg ? (
                    <Image source={{ uri: pImg }} style={styles.photoPreview} />
                  ) : (
                    <TouchableOpacity onPress={() => takePhoto(setPImg)} style={styles.cameraBtn}>
                      <Camera size={24} color="#94A3B8" />
                      <Text style={styles.cameraBtnText}>Tomar Foto</Text>
                    </TouchableOpacity>
                  )}
                  {pImg && (
                    <TouchableOpacity onPress={() => setPImg(null)} style={styles.removePhotoBtn}>
                      <Text style={styles.removePhotoBtnText}>Eliminar Foto</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={handleAddPago} style={styles.modalSubmitBtn} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Guardar Aporte</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- MODAL REGISTRAR GASTO --- */}
        <Modal visible={modalGasto} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Registrar Gasto (Egreso)</Text>
                <TouchableOpacity onPress={() => setModalGasto(false)}><X size={20} color="#fff" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={styles.modalLabel}>Monto ($)</Text>
                <TextInput style={styles.modalInput} keyboardType="numeric" value={gValue} onChangeText={setGValue} placeholder="Ej: 15000" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Descripción del Gasto</Text>
                <TextInput style={styles.modalInput} value={gDesc} onChangeText={setGDesc} placeholder="Ej: Cartulinas y plumones" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Categoría</Text>
                <TextInput style={styles.modalInput} value={gCat} onChangeText={setGCat} placeholder="Ej: Librería, Eventos, Regalos" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Evidencia / Boleta</Text>
                <View style={styles.photoContainer}>
                  {gImg ? (
                    <Image source={{ uri: gImg }} style={styles.photoPreview} />
                  ) : (
                    <TouchableOpacity onPress={() => takePhoto(setGImg)} style={styles.cameraBtn}>
                      <Camera size={24} color="#94A3B8" />
                      <Text style={styles.cameraBtnText}>Tomar Foto Boleta</Text>
                    </TouchableOpacity>
                  )}
                  {gImg && (
                    <TouchableOpacity onPress={() => setGImg(null)} style={styles.removePhotoBtn}>
                      <Text style={styles.removePhotoBtnText}>Eliminar Foto</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={handleAddGasto} style={styles.modalSubmitBtn} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Guardar Gasto</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- MODAL AGREGAR ALUMNO --- */}
        <Modal visible={modalAlumno} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Agregar Alumno/a</Text>
                <TouchableOpacity onPress={() => setModalAlumno(false)}><X size={20} color="#fff" /></TouchableOpacity>
              </View>
              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Nombres</Text>
                <TextInput style={styles.modalInput} value={aNom} onChangeText={setANom} placeholder="Ej: Juan Pablo" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Apellidos</Text>
                <TextInput style={styles.modalInput} value={aApe} onChangeText={setAApe} placeholder="Ej: Pérez González" placeholderTextColor="#64748B" />

                <TouchableOpacity onPress={handleAddAlumno} style={styles.modalSubmitBtn} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Registrar Alumno</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- MODAL CREAR CAMPAÑA --- */}
        <Modal visible={modalCampana} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Crear Campaña Especial</Text>
                <TouchableOpacity onPress={() => setModalCampana(false)}><X size={20} color="#fff" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={styles.modalLabel}>Nombre del Evento / Campaña</Text>
                <TextInput style={styles.modalInput} value={cNom} onChangeText={setCNom} placeholder="Ej: Paseo de fin de año" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Costo p/p o Meta ($)</Text>
                <TextInput style={styles.modalInput} keyboardType="numeric" value={cMeta} onChangeText={setCMeta} placeholder="Ej: 12000" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Foto Portada (Opcional)</Text>
                <View style={styles.photoContainer}>
                  {cImg ? (
                    <Image source={{ uri: cImg }} style={styles.photoPreview} />
                  ) : (
                    <TouchableOpacity onPress={() => takePhoto(setCImg)} style={styles.cameraBtn}>
                      <Camera size={24} color="#94A3B8" />
                      <Text style={styles.cameraBtnText}>Tomar Foto</Text>
                    </TouchableOpacity>
                  )}
                  {cImg && (
                    <TouchableOpacity onPress={() => setCImg(null)} style={styles.removePhotoBtn}>
                      <Text style={styles.removePhotoBtnText}>Eliminar Foto</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={handleAddCampana} style={styles.modalSubmitBtn} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Crear Campaña</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- MODAL APORTE CAMPAÑA --- */}
        <Modal visible={modalPagoCampana} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Abonar a Campaña</Text>
                <TouchableOpacity onPress={() => setModalPagoCampana(false)}><X size={20} color="#fff" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={styles.modalLabel}>Campaña</Text>
                <View style={styles.pickerReplacement}>
                  <ScrollView style={{ maxHeight: 100 }}>
                    {campanas.filter(c => c.estado !== "realizada").map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.pickerItem, pcCampanaId === c.id && styles.pickerItemSel]}
                        onPress={() => setPcCampanaId(c.id)}
                      >
                        <Text style={[styles.pickerItemText, pcCampanaId === c.id && styles.pickerItemTextSel]}>{c.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.modalLabel}>Alumno/a</Text>
                <View style={styles.pickerReplacement}>
                  <ScrollView style={{ maxHeight: 100 }}>
                    {alumnos.map(a => (
                      <TouchableOpacity
                        key={a.id}
                        style={[styles.pickerItem, pcAlumnoId === a.id && styles.pickerItemSel]}
                        onPress={() => setPcAlumnoId(a.id)}
                      >
                        <Text style={[styles.pickerItemText, pcAlumnoId === a.id && styles.pickerItemTextSel]}>{a.apellido} {a.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.modalLabel}>Monto Abono ($)</Text>
                <TextInput style={styles.modalInput} keyboardType="numeric" value={pcVal} onChangeText={setPcVal} placeholder="Ej: 8000" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Comprobante</Text>
                <View style={styles.photoContainer}>
                  {pcImg ? (
                    <Image source={{ uri: pcImg }} style={styles.photoPreview} />
                  ) : (
                    <TouchableOpacity onPress={() => takePhoto(setPcImg)} style={styles.cameraBtn}>
                      <Camera size={24} color="#94A3B8" />
                      <Text style={styles.cameraBtnText}>Tomar Foto</Text>
                    </TouchableOpacity>
                  )}
                  {pcImg && (
                    <TouchableOpacity onPress={() => setPcImg(null)} style={styles.removePhotoBtn}>
                      <Text style={styles.removePhotoBtnText}>Eliminar Foto</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={handleAddPagoCampana} style={styles.modalSubmitBtn} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Registrar Aporte</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* --- MODAL PAGAR CAMPAÑA DESDE CAJA --- */}
        <Modal visible={modalPagarCaja} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Pagar Campaña desde Caja</Text>
                <TouchableOpacity onPress={() => setModalPagarCaja(false)}><X size={20} color="#fff" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={styles.pccLabel}>Campaña a Cerrar: <Text style={{ color: "#10B981" }}>{pccNombreCampana}</Text></Text>
                <Text style={styles.pccText}>
                  Esto creará automáticamente un Gasto general y debitará los fondos del balance central del curso, cerrando y archivando el evento.
                </Text>

                <Text style={styles.modalLabel}>Monto Total a Cancelar ($)</Text>
                <TextInput style={styles.modalInput} keyboardType="numeric" value={pccVal} onChangeText={setPccVal} placeholder="Monto total del evento" placeholderTextColor="#64748B" />

                <Text style={styles.modalLabel}>Boleta de Respaldo</Text>
                <View style={styles.photoContainer}>
                  {pccImg ? (
                    <Image source={{ uri: pccImg }} style={styles.photoPreview} />
                  ) : (
                    <TouchableOpacity onPress={() => takePhoto(setPccImg)} style={styles.cameraBtn}>
                      <Camera size={24} color="#94A3B8" />
                      <Text style={styles.cameraBtnText}>Tomar Foto Boleta</Text>
                    </TouchableOpacity>
                  )}
                  {pccImg && (
                    <TouchableOpacity onPress={() => setPccImg(null)} style={styles.removePhotoBtn}>
                      <Text style={styles.removePhotoBtnText}>Eliminar Foto</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={handlePagarCampanaCaja} style={[styles.modalSubmitBtn, { backgroundColor: "#10B981" }]} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitBtnText}>Confirmar Pago y Finalizar Campaña</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal Visualizar Imagen */}
        <Modal visible={!!selectedImg} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => setSelectedImg(null)} style={styles.closeModalButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              {selectedImg && (
                <Image source={{ uri: selectedImg }} style={styles.modalImage} contentFit="contain" />
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  loadingText: {
    color: "#94A3B8",
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  cursoNombre: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F8FAFC",
  },
  cursoCodigo: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    backgroundColor: "rgba(15, 118, 110, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  saldoText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#F8FAFC",
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  statColumn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValueGreen: {
    fontSize: 14,
    fontWeight: "800",
    color: "#10B981",
  },
  statValueRed: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FDA4AF",
  },
  actionsPanel: {
    marginBottom: 16,
  },
  actionsRow: {
    gap: 10,
    paddingRight: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  pendingCampanasSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pendingCampanasRow: {
    gap: 8,
  },
  pendingCampanaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderColor: "rgba(124, 58, 237, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pendingCampanaBadgeText: {
    color: "#C084FC",
    fontSize: 12,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: "#F8FAFC",
    fontWeight: "800",
  },
  listSection: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#F8FAFC",
    fontSize: 13,
  },
  listContent: {
    gap: 8,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: "rgba(30, 41, 59, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E2E8F0",
    textTransform: "capitalize",
  },
  itemSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemValueGreen: {
    fontSize: 14,
    fontWeight: "800",
    color: "#10B981",
  },
  itemValueRed: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
  },
  receiptIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  receiptIconBtnRed: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  deactivateBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deactivateBtnText: {
    color: "#FDA4AF",
    fontSize: 11,
    fontWeight: "700",
  },
  // Modal Styles
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    padding: 24,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  modalForm: {
    paddingBottom: 40,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 14,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    fontSize: 15,
  },
  pickerReplacement: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 6,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pickerItemSel: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  pickerItemText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  pickerItemTextSel: {
    color: "#10B981",
    fontWeight: "800",
  },
  photoContainer: {
    height: 120,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cameraBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraBtnText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    bottom: 8,
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removePhotoBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  modalSubmitBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  modalSubmitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // PCC Specific
  pccLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  pccText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 16,
  },
  // Image Viewer Modal
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  activationBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  activationBannerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FDA4AF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  activationBannerText: {
    fontSize: 11,
    color: "#E2E8F0",
    lineHeight: 16,
    marginBottom: 8,
  },
  activationBannerDetails: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    lineHeight: 14,
    marginBottom: 12,
  },
  activationBannerBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  activationBannerBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  // Estilos de Banner Demo
  demoBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
  },
  demoBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  demoBannerTextGroup: {
    flex: 1,
  },
  demoBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 4,
  },
  demoBannerDesc: {
    fontSize: 11,
    color: "#E2E8F0",
    lineHeight: 15,
  },
  demoSwitchButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "center",
  },
  demoSwitchButtonText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
});
