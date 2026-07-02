import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, BookOpen, Lock, Tag, Users } from "lucide-react-native";
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

export default function CreateCourseScreen() {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateCourse = async () => {
    if (!nombre.trim() || !codigo.trim() || !password.trim()) {
      Alert.alert("Atención", "Por favor completa todos los campos.");
      return;
    }

    if (codigo.length < 4) {
      Alert.alert("Atención", "El código debe tener al menos 4 caracteres.");
      return;
    }

    setLoading(true);
    const formattedCode = codigo.trim().toUpperCase().replace(/\s+/g, "");

    try {
      // 1. Verificar si ya existe ese código
      const { data: existing, error: checkError } = await supabase
        .from("cursos")
        .select("id")
        .eq("codigo", formattedCode)
        .maybeSingle();

      if (existing) {
        Alert.alert(
          "Código en uso",
          "Este código de curso ya está registrado. Por favor elige otro."
        );
        setLoading(false);
        return;
      }

      // 2. Insertar el nuevo curso como inactivo (pendiente de activación por pago)
      const { data: newCourse, error: insertError } = await supabase
        .from("cursos")
        .insert([
          {
            nombre: nombre.trim(),
            codigo: formattedCode,
            admin_password: password.trim(),
            activo: false,
          },
        ])
        .select()
        .single();

      if (insertError || !newCourse) {
        throw new Error(insertError?.message || "Error al guardar el curso.");
      }

      // 3. Autologuearse como Admin del nuevo curso
      await AsyncStorage.setItem("curso_id", newCourse.id);
      await AsyncStorage.setItem("curso_codigo", newCourse.codigo);
      await AsyncStorage.setItem("curso_nombre", newCourse.nombre);
      await AsyncStorage.setItem("admin_logged_in", "true");

      Alert.alert(
        "¡Curso Creado!",
        `Tu curso se ha registrado exitosamente.\n\nPara activarlo por todo el año escolar (hasta Diciembre 2026) y permitir el acceso de los apoderados, realiza la transferencia anual de $12.000 CLP.\n\nDatos de transferencia:\nBanco: Banco Estado\nTipo: Cuenta RUT\nNúmero: 12345678\nRut: 12.345.678-9\nEmail: pagos@classtreasury.com\n\nPresiona OK para ingresar y configurar tus alumnos y cuotas.`,
        [
          {
            text: "Entrar al Panel Admin",
            onPress: () => router.replace("/admin-dashboard"),
          },
        ]
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Ocurrió un problema al crear el curso.");
    } finally {
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
              <BookOpen size={30} color="#10B981" />
            </View>
            <Text style={styles.title}>Crear Nuevo Curso</Text>
            <Text style={styles.subtitle}>
              Inicializa las finanzas y la directiva escolar para tu clase.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.glassCard}>
            {/* Nombre del curso */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Curso</Text>
              <View style={styles.inputContainer}>
                <Users size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  placeholder="Ej: 5º Básico B - Colegio San Agustín"
                  placeholderTextColor="#64748B"
                  value={nombre}
                  onChangeText={setNombre}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Código único */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código único de acceso</Text>
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
              <Text style={styles.hint}>
                Los apoderados ingresarán con este código para visualizar la caja.
              </Text>
            </View>

            {/* Contraseña Administrador */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña de Administrador (Directiva)</Text>
              <View style={styles.inputContainer}>
                <Lock size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña secreta"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>
              <Text style={styles.hint}>
                Clave privada obligatoria para registrar pagos, gastos y cargar boletas.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreateCourse}
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Crear Curso y Acceder</Text>
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
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
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
  hint: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#10B981",
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
