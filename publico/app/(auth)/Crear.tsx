import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  // Estados para controlar los Modales Estilizados
  const [modalGeneroVisible, setModalGeneroVisible] = useState(false);
  const [modalDeptoVisible, setModalDeptoVisible] = useState(false);
  const [modalMunicipioVisible, setModalMunicipioVisible] = useState(false);

  // Estados para el Flujo Guiado de Fecha (Año -> Mes -> Día)
  const [modalFechaPaso, setModalFechaPaso] = useState<"none" | "year" | "month" | "day">("none");
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth());

  // Arreglo de meses para el selector personalizado
  const mesesAnio = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

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

  // Generar lista de años (desde 1950 hasta el año actual)
  const generarAnios = () => {
    const anioActual = new Date().getFullYear();
    const lista = [];
    for (let i = anioActual; i >= 1950; i--) {
      lista.push(i);
    }
    return lista;
  };

  // Generar número de días adaptado según el año y mes seleccionado
  const generarDias = (anio: number, mes: number) => {
    const numDias = new Date(anio, mes + 1, 0).getDate();
    const lista = [];
    for (let i = 1; i <= numDias; i++) {
      lista.push(i);
    }
    return lista;
  };

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

  // Validar y enviar formulario
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
      showToast("✅ Paso 1 completado", true);
      router.push("/(auth)/Crear2");
    } catch (error) {
      console.error("Error guardando datos del paso 1:", error);
      showToast("❌ Error guardando datos");
    }
  };

  // Métodos informativos de etiquetas
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

            {/* SELECCIÓN GÉNERO ESTILIZADA */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalGeneroVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.input, { color: genero ? "#000" : "#666" }]}>
                {getGeneroLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#213A8E" />
            </TouchableOpacity>

            {/* SELECCIÓN FECHA - PASO AÑO PRIMERO */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalFechaPaso("year")}
              activeOpacity={0.8}
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

            {/* SELECCIÓN DEPARTAMENTO ESTILIZADA */}
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalDeptoVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.input, { color: departamento ? "#000" : "#666" }]}>
                {getDepartamentoLabel()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#213A8E" />
            </TouchableOpacity>

            {/* SELECCIÓN MUNICIPIO ESTILIZADA */}
            <TouchableOpacity
              style={[
                styles.inputContainer,
                !departamento && styles.disabledInput,
              ]}
              onPress={() => departamento && setModalMunicipioVisible(true)}
              disabled={!departamento}
              activeOpacity={0.8}
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
                style={styles.buttonYellowBack}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonBlueNext}
                onPress={handleSubmit}
              >
                <Ionicons name="arrow-forward" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>

      {/* ================= MODALES DE CATÁLOGOS CON TUS ESTILOS PROPIOS ================= */}

      {/* MODAL GÉNERO */}
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
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalGeneroVisible(false)}>
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
                  style={[styles.especialidadOption, genero === item.value && styles.especialidadSelected]}
                  onPress={() => {
                    setGenero(item.value);
                    setModalGeneroVisible(false);
                  }}
                >
                  <Ionicons 
                    name={genero === item.value ? "radio-button-on" : "radio-button-off"} 
                    size={22} 
                    color={genero === item.value ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.especialidadText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DEPARTAMENTOS */}
      <Modal
        visible={modalDeptoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDeptoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona el Departamento</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalDeptoVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {departamentos.map((dep) => (
                <TouchableOpacity
                  key={dep.idDepartamento}
                  style={[styles.especialidadOption, departamento === dep.idDepartamento && styles.especialidadSelected]}
                  onPress={() => {
                    setDepartamento(dep.idDepartamento);
                    setModalDeptoVisible(false);
                  }}
                >
                  <Ionicons 
                    name={departamento === dep.idDepartamento ? "radio-button-on" : "radio-button-off"} 
                    size={22} 
                    color={departamento === dep.idDepartamento ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.especialidadText}>{dep.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL MUNICIPIOS */}
      <Modal
        visible={modalMunicipioVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalMunicipioVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona el Municipio</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalMunicipioVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {municipios.map((mun) => (
                <TouchableOpacity
                  key={mun.idMunicipio}
                  style={[styles.especialidadOption, municipio === mun.idMunicipio && styles.especialidadSelected]}
                  onPress={() => {
                    setMunicipio(mun.idMunicipio);
                    setModalMunicipioVisible(false);
                  }}
                >
                  <Ionicons 
                    name={municipio === mun.idMunicipio ? "radio-button-on" : "radio-button-off"} 
                    size={22} 
                    color={municipio === mun.idMunicipio ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.especialidadText}>{mun.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODALES DE FECHA SECUENCIAL (AÑO PRIMERO) ================= */}

      {/* PASO 1: SELECCIONAR AÑO */}
      <Modal
        visible={modalFechaPaso === "year"}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFechaPaso("none")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paso 1: Selecciona el Año</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalFechaPaso("none")}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {generarAnios().map((anio) => (
                <TouchableOpacity
                  key={anio}
                  style={[styles.especialidadOption, añoSeleccionado === anio && styles.especialidadSelected]}
                  onPress={() => {
                    setAñoSeleccionado(anio);
                    setModalFechaPaso("month");
                  }}
                >
                  <Ionicons 
                    name={añoSeleccionado === anio ? "radio-button-on" : "radio-button-off"} 
                    size={22} 
                    color={añoSeleccionado === anio ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.especialidadText}>{anio}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PASO 2: SELECCIONAR MES */}
      <Modal
        visible={modalFechaPaso === "month"}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFechaPaso("none")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paso 2: Selecciona el Mes</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalFechaPaso("year")}>
                <Ionicons name="arrow-back" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {mesesAnio.map((mes, index) => (
                <TouchableOpacity
                  key={mes}
                  style={[styles.especialidadOption, mesSeleccionado === index && styles.especialidadSelected]}
                  onPress={() => {
                    setMesSeleccionado(index);
                    setModalFechaPaso("day");
                  }}
                >
                  <Ionicons 
                    name={mesSeleccionado === index ? "radio-button-on" : "radio-button-off"} 
                    size={22} 
                    color={mesSeleccionado === index ? "#2666DE" : "#666"} 
                  />
                  <Text style={styles.especialidadText}>{mes}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PASO 3: SELECCIONAR DÍA */}
      <Modal
        visible={modalFechaPaso === "day"}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFechaPaso("none")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paso 3: Selecciona el Día</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalFechaPaso("month")}>
                <Ionicons name="arrow-back" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {generarDias(añoSeleccionado, mesSeleccionado).map((dia) => (
                <TouchableOpacity
                  key={dia}
                  style={styles.especialidadOption}
                  onPress={() => {
                    const fechaFinal = new Date(añoSeleccionado, mesSeleccionado, dia);
                    setFechaNacimiento(fechaFinal);
                    setModalFechaPaso("none");
                  }}
                >
                  <Ionicons name="calendar-outline" size={22} color="#2666DE" />
                  <Text style={styles.especialidadText}>Día {dia}</Text>
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
  
  // TUS ESTILOS ORIGINALES CON BORDES AZULES NEÓN PERFECTOS
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderLeftWidth: 15,
    borderLeftColor: "#2666DE",
    height: 55,
    marginBottom: 15,
    shadowColor: "#2666DE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledInput: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#000",
    height: 55,
    textAlignVertical: "center",
  },
  iconCalendar: { 
    marginRight: 0 
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  buttonYellowBack: {
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
  buttonBlueNext: {
    backgroundColor: "#F9DC50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 10,
  },

  // ESTILOS DE LOS MODALES SACADOS DE TU EJEMPLO DE PROYECTOS
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
  especialidadOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  especialidadSelected: {
    backgroundColor: "#F2F6FC",
  },
  especialidadText: {
    marginLeft: 12,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#333",
    flex: 1,
  },
});