import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Calendar,
  LogOut,
  PartyPopper,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function ParentDashboardScreen() {
  const [cursoId, setCursoId] = useState<string | null>(null);
  const [cursoCodigo, setCursoCodigo] = useState("");
  const [cursoNombre, setCursoNombre] = useState("");
  const [loading, setLoading] = useState(true);

  const [saldo, setSaldo] = useState(0);
  const [ingresos, setIngresos] = useState(0);
  const [gastos, setGastos] = useState(0);

  const [listaGastos, setListaGastos] = useState<any[]>([]);
  const [listaPagos, setListaPagos] = useState<any[]>([]);
  const [campanas, setCampanas] = useState<any[]>([]);
  const [pagosCampanas, setPagosCampanas] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"aportes" | "egresos">("aportes");
  const [filtroAlumno, setFiltroAlumno] = useState("");
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // Cargar sesión inicial
  useEffect(() => {
    const loadSession = async () => {
      const id = await AsyncStorage.getItem("curso_id");
      const code = await AsyncStorage.getItem("curso_codigo");
      const nombre = await AsyncStorage.getItem("curso_nombre");

      if (id && code && nombre) {
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
      const { data: g } = await supabase
        .from("gastos")
        .select("*")
        .eq("curso_id", id)
        .order("fecha", { ascending: false });

      const { data: p } = await supabase
        .from("pagos")
        .select(`id, monto, mes, fecha, comprobante_url, alumnos(nombre, apellido)`)
        .eq("curso_id", id)
        .order("fecha", { ascending: false });

      const { data: c } = await supabase
        .from("campanas")
        .select("*")
        .eq("curso_id", id)
        .order("fecha_creacion", { ascending: false });

      const { data: pc } = await supabase
        .from("pagos_campanas")
        .select(`id, monto, campana_id, alumnos (nombre, apellido)`)
        .eq("curso_id", id);

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
      .channel("mobile_parent_realtime")
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

  // Filtrado de pagos por alumno
  const pagosFiltrados = listaPagos.filter((p) => {
    if (!p.alumnos) return false;
    const nombreCompleto =
      `${p.alumnos.nombre} ${p.alumnos.apellido}`.toLowerCase();
    return nombreCompleto.includes(filtroAlumno.toLowerCase());
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando finanzas del curso...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#0F172A", "#1E1B4B"]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.cursoNombre}>{cursoNombre}</Text>
            <Text style={styles.cursoCodigo}>Código: {cursoCodigo}</Text>
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
                <Text style={styles.demoBannerTitle}>🧪 Modo Demo: Vista Apoderado</Text>
                <Text style={styles.demoBannerDesc}>
                  Estás viendo el panel de consulta. Busca "Martín" o haz clic en el botón de recibo de un aporte para ver su comprobante.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.replace("/admin-dashboard")}
                style={styles.demoSwitchButton}
              >
                <Text style={styles.demoSwitchButtonText}>Probar Directiva 🔑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Resumen Financiero (Stats Card) */}
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Saldo Disponible</Text>
          <Text style={styles.saldoText}>${saldo.toLocaleString("es-CL")}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <View style={styles.statIconContainerGreen}>
                <TrendingUp size={14} color="#10B981" />
              </View>
              <View>
                <Text style={styles.statsLabel}>Ingresos</Text>
                <Text style={styles.statValueGreen}>
                  +${ingresos.toLocaleString("es-CL")}
                </Text>
              </View>
            </View>

            <View style={styles.dividerVertical} />

            <View style={styles.statColumn}>
              <View style={styles.statIconContainerRed}>
                <TrendingDown size={14} color="#EF4444" />
              </View>
              <View>
                <Text style={styles.statsLabel}>Gastos</Text>
                <Text style={styles.statValueRed}>
                  -${gastos.toLocaleString("es-CL")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Campañas Especiales */}
        {campanas.length > 0 && (
          <View style={styles.campanasSection}>
            <View style={styles.sectionHeader}>
              <PartyPopper size={18} color="#C084FC" />
              <Text style={styles.sectionTitle}>Campañas Especiales</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={campanas}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.campanasList}
              renderItem={({ item }) => {
                const recaudado = pagosCampanas
                  .filter((pc) => pc.campana_id === item.id)
                  .reduce((acc, curr) => acc + curr.monto, 0);

                const meta = item.monto_objetivo;
                const porcentaje = meta > 0 ? Math.min((recaudado / meta) * 100, 100) : 0;

                return (
                  <View style={styles.campanaCard}>
                    <Text style={styles.campanaNombre}>{item.nombre}</Text>
                    <Text style={styles.campanaCosto}>
                      Costo p/p: <Text style={styles.purpleText}>${meta.toLocaleString("es-CL")}</Text>
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${porcentaje}%` }]} />
                    </View>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressPercent}>{porcentaje.toFixed(0)}%</Text>
                      <Text style={styles.progressCollected}>
                        Recaudado: ${recaudado.toLocaleString("es-CL")}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "aportes" && styles.activeTab]}
            onPress={() => setActiveTab("aportes")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "aportes" && styles.activeTabText,
              ]}
            >
              Aportes Cuota Anual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "egresos" && styles.activeTab]}
            onPress={() => setActiveTab("egresos")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "egresos" && styles.activeTabText,
              ]}
            >
              Historial Egresos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content list */}
        {activeTab === "aportes" ? (
          <View style={styles.listSection}>
            {/* Buscador */}
            <View style={styles.searchContainer}>
              <Search size={16} color="#64748B" style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar por nombre o apellido..."
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
              ListEmptyComponent={
                <Text style={styles.emptyText}>No se encontraron aportes registrados.</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <User size={16} color="#10B981" style={styles.itemIcon} />
                    <View>
                      <Text style={styles.itemTitle}>
                        {item.alumnos?.apellido} {item.alumnos?.nombre}
                      </Text>
                      <Text style={styles.itemSub}>{item.mes}</Text>
                    </View>
                  </View>
                  <View style={styles.itemActionContainer}>
                    <Text style={styles.itemValueGreen}>
                      +${item.monto.toLocaleString("es-CL")}
                    </Text>
                    {item.comprobante_url && (
                      <TouchableOpacity
                        onPress={() => setSelectedImg(item.comprobante_url)}
                        style={styles.receiptButton}
                      >
                        <Receipt size={14} color="#10B981" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        ) : (
          <View style={styles.listSection}>
            <FlatList
              data={listaGastos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay gastos registrados aún.</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Calendar size={16} color="#EF4444" style={styles.itemIcon} />
                    <View>
                      <Text style={styles.itemTitle}>{item.descripcion}</Text>
                      <Text style={styles.itemSub}>
                        {new Date(item.fecha).toLocaleDateString("es-CL")} | {item.categoria}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemActionContainer}>
                    <Text style={styles.itemValueRed}>
                      -${item.monto.toLocaleString("es-CL")}
                    </Text>
                    {item.boleta_url && (
                      <TouchableOpacity
                        onPress={() => setSelectedImg(item.boleta_url)}
                        style={styles.receiptButtonRed}
                      >
                        <Receipt size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* Modal de Imagen */}
        <Modal visible={!!selectedImg} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => setSelectedImg(null)}
                style={styles.closeModalButton}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
              {selectedImg && (
                <Image
                  source={{ uri: selectedImg }}
                  style={styles.modalImage}
                  contentFit="contain"
                />
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
    marginBottom: 20,
    marginTop: 8,
  },
  cursoNombre: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F8FAFC",
  },
  cursoCodigo: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  saldoText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#F8FAFC",
    marginVertical: 8,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 16,
  },
  statColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainerGreen: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  statIconContainerRed: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  statValueGreen: {
    fontSize: 15,
    fontWeight: "800",
    color: "#10B981",
    marginTop: 2,
  },
  statValueRed: {
    fontSize: 15,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 16,
  },
  campanasSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  campanasList: {
    gap: 12,
  },
  campanaCard: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(192, 132, 252, 0.2)",
    borderRadius: 20,
    padding: 16,
    width: 220,
  },
  campanaNombre: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  campanaCosto: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  purpleText: {
    fontWeight: "800",
    color: "#C084FC",
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#C084FC",
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C084FC",
  },
  progressCollected: {
    fontSize: 10,
    color: "#64748B",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
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
    backgroundColor: "rgba(30, 41, 59, 0.3)",
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
    gap: 12,
  },
  itemIcon: {
    marginTop: 2,
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
  itemActionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemValueGreen: {
    fontSize: 15,
    fontWeight: "800",
    color: "#10B981",
  },
  itemValueRed: {
    fontSize: 15,
    fontWeight: "800",
    color: "#EF4444",
  },
  receiptButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  receiptButtonRed: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 13,
    fontStyle: "italic",
    paddingVertical: 40,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
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
  // Estilos de Banner Demo
  demoBanner: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
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
    color: "#818CF8",
    marginBottom: 4,
  },
  demoBannerDesc: {
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 15,
  },
  demoSwitchButton: {
    backgroundColor: "#6366F1",
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
