import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Key, Lock, Tag } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function AdminLoginScreen() {
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!codigo.trim() || !password.trim()) {
      Alert.alert("Atención", "Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    const formattedCode = codigo.trim().toUpperCase().replace(/\s+/g, "");

    try {
      // Validar credenciales en la base de datos
      const { data, error } = await supabase
        .from("cursos")
        .select("id, codigo, nombre, admin_password")
        .eq("codigo", formattedCode)
        .single();

      if (error || !data) {
        Alert.alert(
          "Error de Acceso",
          "El código de curso ingresado no existe."
        );
        setLoading(false);
        return;
      }

      if (data.admin_password !== password.trim()) {
        Alert.alert(
          "Clave Incorrecta",
          "La contraseña del administrador es incorrecta."
        );
        setLoading(false);
        return;
      }

      // Guardar sesión de administrador
      await AsyncStorage.setItem("curso_id", data.id);
      await AsyncStorage.setItem("curso_codigo", data.codigo);
      await AsyncStorage.setItem("curso_nombre", data.nombre);
      await AsyncStorage.setItem("admin_logged_in", "true");

      setLoading(false);
      router.replace("/admin-dashboard");
    } catch (e: any) {
      Alert.alert(
        "Error",
        "Ocurrió un problema de conexión al validar las credenciales."
      );
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0F172A", "#1E1B4B"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#94A3B8" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Key size={30} color="#818CF8" />
            </View>
            <Text style={styles.title}>Panel de Directiva</Text>
            <Text style={styles.subtitle}>
              Inicia sesión como administrador para registrar transacciones y boletas.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.glassCard}>
            {/* Código del curso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código del Curso</Text>
              <View style={styles.inputContainer}>
                <Tag size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  placeholder="Ej: CL-5B-2026"
                  placeholderTextColor="#64748B"
                  value={codigo}
                  onChangeText={setCodigo}
                  autoCapitalize="characters"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña de Administrador</Text>
              <View style={styles.inputContainer}>
                <Lock size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  placeholder="Ingresa la contraseña del curso"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 40 : 20,
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#94A3B8",
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.25)",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 290,
  },
  glassCard: {
    backgroundColor: "rgba(30, 41, 59, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#F8FAFC",
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
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
  },
});
