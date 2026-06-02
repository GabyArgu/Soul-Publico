// app/(auth)/Crear3.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-root-toast";
import { API_URL } from "../utils/config";

export default function Crear3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const paso2Data = params.combinedData
    ? JSON.parse(params.combinedData as string)
    : {};

  // Estados
  const [transportarse, setTransportarse] = useState(false);
  const [horario, setHorario] = useState<number | "">("");
  const [cv, setCv] = useState<any>(null); // objeto completo del archivo
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [opcionesDisponibilidad, setOpcionesDisponibilidad] = useState<
    { idDisponibilidad: number; nombre: string }[]
  >([]);

  // Estado para controlar la visibilidad del modal de disponibilidad
  const [modalHorarioVisible, setModalHorarioVisible] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/disponibilidad`)
      .then((res) => setOpcionesDisponibilidad(res.data))
      .catch(() => showToast("❌ Error al cargar opciones de horario"));
  }, []);

  const showToast = (message: string, success: boolean = false) => {
    Toast.show(message, {
      duration: 3000,
      position: Toast.positions.TOP,
      shadow: true,
      animation: true,
      hideOnPress: true,
      backgroundColor: success ? "#4CAF50" : "#E53935",
      textColor: "#fff",
      opacity: 0.95,
      containerStyle: {
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 60,
        alignSelf: "center",
      },
      textStyle: { fontFamily: "Inter-Medium", fontSize: 14 },
    });
  };

  // Seleccionar archivo
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (!result.canceled) {
        setCv(result.assets[0]); // guardamos todo el objeto
        showToast("📄 Archivo seleccionado: " + result.assets[0].name, true);
      }
    } catch (error) {
      console.error(error);
      showToast("❌ Error al seleccionar archivo");
    }
  };

  // Subir CV al servidor - VERSIÓN MEJORADA PARA DEBUG
  const uploadCv = async () => {
    if (!cv) throw new Error("No se seleccionó CV");

    console.log("📤 Intentando subir archivo:", cv.name, "URI:", cv.uri);

    const formData = new FormData();
    formData.append("cv", {
      uri: cv.uri,
      name: cv.name || "documento.pdf",
      type: "application/pdf",
    } as any);

    try {
      const res = await axios.post(`${API_URL}/cv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 segundos timeout
      });

      console.log("✅ Respuesta del servidor:", res.data);
      return res.data.url;
    } catch (error: any) {
      console.error(
        "❌ Error en uploadCv:",
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!cv) return showToast("❌ Debes subir tu CV");
    if (!horario) return showToast("❌ Debes seleccionar tu disponibilidad horaria");
    if (password !== confirmPassword)
      return showToast("⚠️ Las contraseñas no coinciden");

    try {
      // 1️⃣ Subir CV
      const urlCv = await uploadCv();

      // 2️⃣ Combinar datos con pasos anteriores
      const combinedData = {
        ...paso2Data,
        transportarse,
        idHorario: Number(horario),
        password,
        urlCv,
      };

      console.log("Campos antes de enviar:", combinedData);

      // 3️⃣ Crear usuario en backend
      await axios.post(`${API_URL}/usuarios/crear`, combinedData);

      // Limpiar AsyncStorage si quieres
      await AsyncStorage.removeItem("crearPaso1");
      await AsyncStorage.removeItem("crearPaso2");

      router.push("/SplashH");
    } catch (error) {
      console.error("Error creando usuario:", error);
      showToast("❌ Error creando usuario");
    }
  };

  // Obtener el nombre del horario seleccionado para mostrarlo en el trigger
  const getHorarioTexto = () => {
    const seleccionado = opcionesDisponibilidad.find(
      (opc) => opc.idDisponibilidad === horario
    );
    return seleccionado ? seleccionado.nombre : "Disponibilidad horaria";
  };

  return (
    <ImageBackground
      source={require("../../assets/images/fondo-c.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.mainContainer}>
        <KeyboardAwareScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          extraHeight={120}
          enableOnAndroid
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Información Extra</Text>

            {/* Transportarse */}
            <View
              style={[
                styles.inputContainer,
                { justifyContent: "space-between" },
              ]}
            >
              <Text style={styles.switchText}>Posees transporte</Text>
              <Switch
                value={transportarse}
                onValueChange={setTransportarse}
                trackColor={{ false: "#ccc", true: "#2666DE" }}
                thumbColor="#fff"
              />
            </View>

            {/* HORARIO - CAMBIADO POR TOUCHABLE OPACITY PARA DETONAR EL BOTTOM-SHEET MODAL */}
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setModalHorarioVisible(true)}
            >
              <Text
                style={[
                  styles.input,
                  { color: horario ? "#000" : "#666" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getHorarioTexto()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#213A8E" />
            </TouchableOpacity>

            {/* Subir CV */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={pickDocument}
            >
              <Text style={[styles.input, { color: cv ? "#000" : "#666" }]}>
                {cv ? cv.name : "Sube tu CV"}
              </Text>
              <Ionicons name="cloud-upload-outline" size={22} color="#213A8E" />
            </TouchableOpacity>

            {/* Contraseña */}
            <Text style={[styles.title, { marginTop: 10 }]}>Seguridad</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Escribe tu contraseña"
                placeholderTextColor="#666"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirma tu contraseña"
                placeholderTextColor="#666"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Botones */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.buttonYellow}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonBlue}
                onPress={handleSubmit}
              >
                <Ionicons name="arrow-forward" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>

      {/* NUEVO MODAL DE DISPONIBILIDAD HORARIA */}
      <Modal
        visible={modalHorarioVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalHorarioVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disponibilidad horaria</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalHorarioVisible(false)}
              >
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {opcionesDisponibilidad.map((opcion) => {
                const esSeleccionado = horario === opcion.idDisponibilidad;
                return (
                  <TouchableOpacity
                    key={opcion.idDisponibilidad}
                    style={[
                      styles.horarioOption,
                      esSeleccionado && styles.horarioSelected,
                    ]}
                    onPress={() => {
                      setHorario(opcion.idDisponibilidad);
                      setModalHorarioVisible(false);
                    }}
                  >
                    <Ionicons
                      name={esSeleccionado ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={esSeleccionado ? "#2666DE" : "#666"}
                    />
                    <Text
                      style={[
                        styles.horarioText,
                        { fontWeight: esSeleccionado ? "bold" : "normal" },
                      ]}
                    >
                      {opcion.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  mainContainer: { flex: 1, marginTop: 220 },
  scrollContent: { flex: 1 },
  scrollContainer: { alignItems: "center", paddingBottom: 40 },
  formContainer: {
    width: "85%",
    borderRadius: 15,
    padding: 8,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#213A8E",
    marginBottom: 18,
    fontFamily: "Inter-Bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF1F8",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderLeftWidth: 15,
    borderLeftColor: "#2666DE",
    height: 52,
  },
  input: { 
    flex: 1, 
    fontSize: 15, 
    fontFamily: "Inter-Medium", 
    color: "#000",
    textAlignVertical: "center",
  },

  switchText: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    fontWeight: "medium",
    color: "#000",
    flex: 1,
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  buttonYellow: {
    backgroundColor: "#2666DE",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonBlue: {
    backgroundColor: "#F9DC50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  // ESTILOS DEL BOTTOM-SHEET MODAL (CONSISTENTE CON PASOS ANTERIORES)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#213A8E",
    fontFamily: "MyriadPro-Bold",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    maxHeight: "70%",
  },
  horarioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  horarioSelected: {
    backgroundColor: "#F2F6FC",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  horarioText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#333",
    flex: 1,
  },
});