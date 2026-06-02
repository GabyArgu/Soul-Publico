import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-root-toast";
import { API_URL } from "../utils/config";

export default function Crear() {
  const router = useRouter();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [carnet, setCarnet] = useState("");
  const [genero, setGenero] = useState<"M" | "F" | "O" | "">(""); 
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Catálogos
  const [departamentos, setDepartamentos] = useState<
    { idDepartamento: number; nombre: string }[]
  >([]);
  const [municipios, setMunicipios] = useState<
    { idMunicipio: number; nombre: string }[]
  >([]);
  const [departamento, setDepartamento] = useState<number | "">("");
  const [municipio, setMunicipio] = useState<number | "">("");

  // Estados para controlar la visibilidad de los Modales (Estilo exacto a tu ejemplo)
  const [modalGeneroVisible, setModalGeneroVisible] = useState(false);
  const [modalDeptoVisible, setModalDeptoVisible] = useState(false);
  const [modalMunicipioVisible, setModalMunicipioVisible] = useState(false);

  // Estados para el flujo secuencial estricto del DatePicker (Año -> Mes -> Día)
  const [dateStep, setDateStep] = useState<"none" | "year" | "month" | "day">("none");
  const [tempYear, setTempYear] = useState<number>(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth());

  // Obtener departamentos al cargar
  useEffect(() => {
    axios
      .get(`${API_URL}/departamentos`)
      .then((res) => setDepartamentos(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Actualizar municipios cuando cambia el departamento
  useEffect(() => {
    if (!departamento) {
      setMunicipios([]);
      setMunicipio("");
      return;
    }
    axios
      .get(`${API_URL}/municipios/${departamento}`)
      .then((res) => setMunicipios(res.data))
      .catch((err) => console.error(err));
  }, [departamento]);

  // Validaciones individuales
  const validarNombre = (text: string) => {
    if (/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/.test(text)) setNombre(text);
  };
  const validarCarnet = (text: string) => {
    if (/^[A-Z]{0,2}[0-9]{0,6}$/.test(text)) setCarnet(text.toUpperCase());
  };
  const validarTelefono = (text: string) => {
    if (/^\d{0,4}-?\d{0,4}$/.test(text))
      setTelefono(text.length === 4 && !text.includes("-") ? text + "-" : text);
  };

  // Mostrar toast personalizado
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

  // Lógica secuencial guiada por pasos para la fecha
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setDateStep("none");
      return;
    }

    if (selectedDate) {
      if (dateStep === "year") {
        setTempYear(selectedDate.getFullYear());
        // Pasamos automáticamente al mes inmediatamente
        setTimeout(() => setDateStep("month"), 150);
      } else if (dateStep === "month") {
        setTempMonth(selectedDate.getMonth());
        // Pasamos automáticamente al día final
        setTimeout(() => setDateStep("day"), 150);
      } else if (dateStep === "day") {
        const finalDate = new Date(tempYear, tempMonth, selectedDate.getDate());
        setFechaNacimiento(finalDate);
        setDateStep("none");
      }
    }
  };

  // Renderizador dinámico del selector nativo calendar
  const renderDatePicker = () => {
    if (dateStep === "none") return null;

    let currentPickerValue = new Date();
    if (dateStep === "month") {
      currentPickerValue = new Date(tempYear, new Date().getMonth(), 1);
    } else if (dateStep === "day") {
      currentPickerValue = new Date(tempYear, tempMonth, 1);
    }

    return (
      <DateTimePicker
        value={currentPickerValue}
        mode="date"
        display="calendar"
        maximumDate={new Date()}
        onChange={handleDateChange}
      />
    );
  };

  // Validar formulario con retroalimentación específica
  const handleSubmit = async () => {
    if (!nombre.trim()) {
      showToast("⚠️ El nombre es obligatorio");
      return;
    }
    if (!/^[A-Z]{2}[0-9]{6}$/.test(carnet)) {
      showToast("⚠️ El carnet debe tener 2 letras y 6 números");
      return;
    }
    if (!genero) {
      showToast("⚠️ Selecciona tu género");
      return;
    } 
    if (!fechaNacimiento) {
      showToast("⚠️ Selecciona una fecha de nacimiento");
      return;
    }
    if (fechaNacimiento >= new Date()) {
      showToast("⚠️ La fecha de nacimiento debe ser menor a hoy");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("⚠️ Ingresa un correo válido");
      return;
    }
    if (!departamento) {
      showToast("⚠️ Selecciona un departamento");
      return;
    }
    if (!municipio) {
      showToast("⚠️ Selecciona un municipio");
      return;
    }
    if (!/^\d{4}-\d{4}$/.test(telefono)) {
      showToast("⚠️ Ingresa un teléfono válido (XXXX-XXXX)");
      return;
    }

    try {
      const paso1Data = {
        nombre,
        carnet,
        genero, 
        fechaNacimiento: fechaNacimiento.toISOString(),
        email,
        telefono,
        departamento: Number(departamento),
        municipio: Number(municipio),
      };

      await AsyncStorage.setItem("crearPaso1", JSON.stringify(paso1Data));
      console.log("Datos del paso 1 guardados:", paso1Data);
      showToast("✅ Paso 1 completado", true);
      router.push("/(auth)/Crear2");
    } catch (error) {
      console.error("Error guardando datos del paso 1:", error);
      showToast("❌ Error guardando datos");
    }
  };

  // Resolutores de etiquetas de texto
  const getGeneroLabel = () => {
    if (genero === "M") return "Masculino";
    if (genero === "F") return "Femenino";
    if (genero === "O") return "Otro";
    return "Género";
  };

  const getDepartamentoLabel = () => {
    if (!departamento) return "Departamento";
    const dep = departamentos.find((d) => d.idDepartamento === departamento);
    return dep ? dep.nombre : "Departamento";
  };

  const getMunicipioLabel = () => {
    if (!departamento) return "Primero selecciona departamento";
    if (!municipio) return "Municipio";
    const mun = municipios.find((m) => m.idMunicipio === municipio);
    return mun ? mun.nombre : "Municipio";
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
          enableOnAndroid={true}
          keyboardOpeningTime={0}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Datos Personales</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#666"
                value={nombre}
                onChangeText={validarNombre}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Carnet"
                placeholderTextColor="#666"
                value={carnet}
                onChangeText={validarCarnet}
              />
            </View>

            {/* SELECTOR ESTILIZADO DE GÉNERO */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalGeneroVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, { color: genero ? "#000" : "#666" }]}>
                {getGeneroLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#213A8E" />
            </TouchableOpacity>

            {/* SELECCIÓN DE FECHA CON FLUJO SECUENCIAL ESTRICTO */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setDateStep("year")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.input,
                  { color: fechaNacimiento ? "#000" : "#666" },
                ]}
              >
                {fechaNacimiento
                  ? fechaNacimiento.toLocaleDateString()
                  : "Fecha de nacimiento"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#213A8E"
                style={styles.iconCalendar}
              />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            {/* SELECTOR ESTILIZADO DE DEPARTAMENTO */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalDeptoVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, { color: departamento ? "#000" : "#666" }]}>
                {getDepartamentoLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#213A8E" />
            </TouchableOpacity>

            {/* SELECTOR ESTILIZADO DE MUNICIPIO (DESHABILITADO SI NO HAY DEPTO) */}
            <TouchableOpacity
              style={[
                styles.inputContainer,
                !departamento && styles.disabledContainer,
              ]}
              onPress={() => departamento && setModalMunicipioVisible(true)}
              disabled={!departamento}
              activeOpacity={0.7}
            >
              <Text style={[styles.input, { color: municipio ? "#000" : "#666" }]}>
                {getMunicipioLabel()}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={departamento ? "#213A8E" : "#999"}
              />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                placeholderTextColor="#666"
                value={telefono}
                onChangeText={validarTelefono}
                keyboardType="numeric"
              />
            </View>

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

      {/* RENDER NATIVO DEL PICKER SECUENCIAL */}
      {renderDatePicker()}

      {/* ================= MODAL GÉNERO (DISEÑO FIEL A TU ARCHIVO PROYECTO.TSX) ================= */}
      <Modal
        visible={modalGeneroVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalGeneroVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu Género</Text>
              <TouchableOpacity onPress={() => setModalGeneroVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {[
                { label: "Masculino", value: "M" as const },
                { label: "Femenino", value: "F" as const },
                { label: "Otro", value: "O" as const },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.optionItem,
                    genero === item.value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    setGenero(item.value);
                    setModalGeneroVisible(false);
                  }}
                >
                  <Ionicons 
                    name={genero === item.value ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={genero === item.value ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL DEPARTAMENTOS (DISEÑO FIEL A TU ARCHIVO PROYECTO.TSX) ================= */}
      <Modal
        visible={modalDeptoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDeptoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona Departamento</Text>
              <TouchableOpacity onPress={() => setModalDeptoVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {departamentos.map((dep) => (
                <TouchableOpacity
                  key={dep.idDepartamento}
                  style={[
                    styles.optionItem,
                    departamento === dep.idDepartamento && styles.optionSelected,
                  ]}
                  onPress={() => {
                    setDepartamento(dep.idDepartamento);
                    setModalDeptoVisible(false);
                  }}
                >
                  <Ionicons 
                    name={departamento === dep.idDepartamento ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={departamento === dep.idDepartamento ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.optionText}>{dep.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL MUNICIPIOS (DISEÑO FIEL A TU ARCHIVO PROYECTO.TSX) ================= */}
      <Modal
        visible={modalMunicipioVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalMunicipioVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona Municipio</Text>
              <TouchableOpacity onPress={() => setModalMunicipioVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {municipios.map((mun) => (
                <TouchableOpacity
                  key={mun.idMunicipio}
                  style={[
                    styles.optionItem,
                    municipio === mun.idMunicipio && styles.optionSelected,
                  ]}
                  onPress={() => {
                    setMunicipio(mun.idMunicipio);
                    setModalMunicipioVisible(false);
                  }}
                >
                  <Ionicons 
                    name={municipio === mun.idMunicipio ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={municipio === mun.idMunicipio ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.optionText}>{mun.nombre}</Text>
                </TouchableOpacity>
              ))}
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
    paddingHorizontal: 15,
    marginBottom: 15,
    borderLeftWidth: 15,
    borderLeftColor: "#2666DE",
    height: 52,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#000",
  },
  iconCalendar: {
    marginRight: 0,
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

  // ESTILOS DE ESTRUCTURA DE MODAL SACADOS DIRECTAMENTE DE PROYECTO.TSX
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#000",
    fontWeight: "bold",
  },
  modalContent: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionSelected: {
    backgroundColor: "#f5f5f5",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#000",
    marginLeft: 10,
  },
});