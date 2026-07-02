import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BookOpen, Key, PlusCircle, ArrowRight, Users, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function WelcomeScreen() {
  const [code, setCode] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    checkSavedSession();
  }, []);

  const checkSavedSession = async () => {
    try {
      const savedCode = await AsyncStorage.getItem("curso_codigo");
      const savedAdmin = await AsyncStorage.getItem("admin_logged_in");

      if (savedCode) {
        if (savedAdmin === "true") {
          router.replace("/admin-dashboard");
        } else {
          router.replace("/parent-dashboard");
        }
      } else {
        setCheckingSession(false);
      }
    } catch (e) {
      console.error(e);
      setCheckingSession(false);
    }
  };

  const handleEnterAsParent = async () => {
    if (!code.trim()) {
      Alert.alert("Atención", "Por favor ingresa un código de curso.");
      return;
    }

    setLoading(true);
    const formattedCode = code.trim().toUpperCase();

    try {
      // Validar si el curso existe y está activo
      const { data, error } = await supabase
        .from("cursos")
        .select("id, nombre, codigo, activo")
        .eq("codigo", formattedCode)
        .single();

      if (error || !data) {
        Alert.alert(
          "Código Inválido",
          "El código del curso no es correcto o no está registrado."
        );
        setLoading(false);
        return;
      }

      if (data.activo === false) {
        Alert.alert(
          "Curso Inactivo",
          "Este curso se encuentra pendiente de activación por pago anual. Por favor, comunícate con el delegado de tu curso."
        );
        setLoading(false);
        return;
      }

      // Guardar sesión
      await AsyncStorage.setItem("curso_id", data.id);
      await AsyncStorage.setItem("curso_codigo", data.codigo);
      await AsyncStorage.setItem("curso_nombre", data.nombre);
      await AsyncStorage.setItem("admin_logged_in", "false");

      setLoading(false);
      router.replace("/parent-dashboard");
    } catch (e: any) {
      Alert.alert("Error", "Ocurrió un problema al conectar con el servidor.");
      setLoading(false);
    }
  };

  const handleEnterDemo = async (isAdmin: boolean) => {
    setLoading(true);
    setShowDemoModal(false);
    try {
      const { data, error } = await supabase
        .from("cursos")
        .select("id, nombre, codigo")
        .eq("codigo", "DEMO-2026")
        .single();

      if (error || !data) {
        Alert.alert(
          "Demo No Disponible",
          "Asegúrate de ejecutar el script `supabase_migration.sql` y el script demo en Supabase primero."
        );
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("curso_id", data.id);
      await AsyncStorage.setItem("curso_codigo", data.codigo);
      await AsyncStorage.setItem("curso_nombre", data.nombre);
      await AsyncStorage.setItem("admin_logged_in", isAdmin ? "true" : "false");

      setLoading(false);
      if (isAdmin) {
        router.replace("/admin-dashboard");
      } else {
        router.replace("/parent-dashboard");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar para cargar la demo.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0F172A", "#1E1B4B"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <BookOpen size={32} color="#818CF8" />
            </View>
            <Text style={styles.appName}>ClassTreasury</Text>
            <Text style={styles.subtitle}>
              Transparencia y finanzas de tu curso escolar al día ✨
            </Text>
          </View>

          {/* Card Apoderados */}
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>Acceso Apoderados</Text>
            <Text style={styles.cardDesc}>
              Ingresa el código que te dio el delegado del curso para ver el dashboard en tiempo real.
            </Text>

            <TextInput
              placeholder="Código de Curso (ej: CL-5B-2026)"
              placeholderTextColor="#64748B"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              style={styles.input}
            />

            <TouchableOpacity
              onPress={handleEnterAsParent}
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Ver Finanzas del Curso</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o también</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => setShowDemoModal(true)}
              style={styles.demoButton}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>Ver Curso Demo 📊</Text>
            </TouchableOpacity>
          </View>

          {/* Acceso Directiva / Admin */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              onPress={() => router.push("/admin-login")}
              style={styles.secondaryButton}
            >
              <Key size={18} color="#818CF8" style={styles.buttonIcon} />
              <View>
                <Text style={styles.secondaryBtnTitle}>Acceso Directiva</Text>
                <Text style={styles.secondaryBtnDesc}>Gestionar cuotas, gastos y caja</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/create-course")}
              style={styles.secondaryButton}
            >
              <PlusCircle size={18} color="#10B981" style={styles.buttonIcon} />
              <View>
                <Text style={styles.secondaryBtnTitle}>Crear Curso / Directiva</Text>
                <Text style={styles.secondaryBtnDesc}>Crear una nueva directiva desde cero</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal interactivo de Selección de Rol en Demo */}
      <Modal
        visible={showDemoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDemoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Probar Demo 📊</Text>
              <TouchableOpacity
                onPress={() => setShowDemoModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              ClassTreasury ofrece dos perfiles distintos. Selecciona cuál de ellos deseas explorar en esta demostración:
            </Text>

            {/* Opción 1: Apoderado */}
            <View style={styles.roleOption}>
              <View style={styles.roleOptionHeader}>
                <View style={[styles.roleIconContainer, { backgroundColor: "rgba(129, 140, 248, 0.15)" }]}>
                  <Users size={18} color="#818CF8" />
                </View>
                <Text style={styles.roleOptionTitle}>Vista de Apoderado 👥</Text>
              </View>
              <Text style={styles.roleOptionDesc}>
                Observa saldos en tiempo real, desglose de gastos de caja, campañas activas de recaudación y revisa los comprobantes adjuntos de forma transparente.
              </Text>
              <TouchableOpacity
                onPress={() => handleEnterDemo(false)}
                style={[styles.roleSelectBtn, { backgroundColor: "#6366F1" }]}
              >
                <Text style={styles.roleSelectBtnText}>Ver como Apoderado</Text>
              </TouchableOpacity>
            </View>

            {/* Opción 2: Administrador/Directiva */}
            <View style={styles.roleOption}>
              <View style={styles.roleOptionHeader}>
                <View style={[styles.roleIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                  <Key size={18} color="#10B981" />
                </View>
                <Text style={styles.roleOptionTitle}>Vista de Directiva 🔑</Text>
              </View>
              <Text style={styles.roleOptionDesc}>
                Prueba las herramientas del delegado: agrega alumnos, crea campañas, registra aportes y usa la cámara del celular para subir fotos de boletas.
              </Text>
              <TouchableOpacity
                onPress={() => handleEnterDemo(true)}
                style={[styles.roleSelectBtn, { backgroundColor: "#10B981" }]}
              >
                <Text style={styles.roleSelectBtnText}>Ver como Administrador</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.3)",
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 280,
  },
  glassCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    padding: 16,
    color: "#F8FAFC",
    fontSize: 15,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  dividerText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  demoButton: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: 14,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  demoButtonText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
  actionsGrid: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: "rgba(30, 41, 59, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  secondaryBtnTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  secondaryBtnDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  // Estilos del Modal interactivo de Demo
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1E1B4B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 28,
    padding: 24,
    width: "100%",
    maxWidth: 365,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F8FAFC",
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 99,
  },
  modalDesc: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
    marginBottom: 20,
  },
  roleOption: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  roleOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  roleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  roleOptionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  roleOptionDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 16,
    marginBottom: 12,
  },
  roleSelectBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleSelectBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },
});

