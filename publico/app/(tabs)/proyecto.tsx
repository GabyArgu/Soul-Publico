// app/(main)/AgregarProyecto.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Toast from "react-native-root-toast";
import { getUserData, UserData } from "../utils/session";
import { API_URL } from "../utils/config";

interface Habilidad {
  idHabilidad: number;
  nombre: string;
  tipo: string;
}

interface Carrera {
  idCarrera: number;
  nombre: string;
}

interface Idioma {
  idIdioma: number;
  nombre: string;
}

interface Nivel {
  idINivel: number;
  nombre: string;
}

interface Institucion {
  idInstitucion: number;
  nombre: string;
  idDepartamento: number;
  idMunicipio: number;
  departamento: string;
  municipio: string;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
}

interface Modalidad {
  idModalidad: number;
  nombre: string;
}

const { width: screenWidth } = Dimensions.get("window");

export default function AgregarProyecto() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Estados para datos de usuario
  const [userData, setUserData] = useState<UserData | null>(null);

  // Estados para datos de API
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [departamentos, setDepartamentos] = useState<
    { idDepartamento: number; nombre: string }[]
  >([]);
  const [municipios, setMunicipios] = useState<
    { idMunicipio: number; nombre: string; idDepartamento: number }[]
  >([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);

  // Estados del formulario
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [especialidades, setEspecialidades] = useState<number[]>([]);
  const [institucion, setInstitucion] = useState<string | number>("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [fechaAplicacion, setFechaAplicacion] = useState<Date | null>(null);
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [showAplicacion, setShowAplicacion] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [horas, setHoras] = useState("");
  const [idiomasSeleccionados, setIdiomasSeleccionados] = useState<
    { idIdioma: number; idINivel: number }[]
  >([]);
  const [modalidad, setModalidad] = useState<string | number>("");

  // Estados para habilidades
  const [inputHabilidadTecnica, setInputHabilidadTecnica] = useState("");
  const [inputHabilidadBlanda, setInputHabilidadBlanda] = useState("");
  const [habilidadesTecnicas, setHabilidadesTecnicas] = useState<Habilidad[]>(
    [],
  );
  const [habilidadesBlandas, setHabilidadesBlandas] = useState<Habilidad[]>([]);
  const [sugerenciasTecnicas, setSugerenciasTecnicas] = useState<Habilidad[]>(
    [],
  );
  const [sugerenciasBlandas, setSugerenciasBlandas] = useState<Habilidad[]>([]);
  const [creandoHabilidad, setCreandoHabilidad] = useState<
    "Técnica" | "Blanda" | null
  >(null);

  // Estados para modales (AÑADIDOS NUEVOS MODALES ESTILIZADOS)
  const [modalEspecialidadesVisible, setModalEspecialidadesVisible] = useState(false);
  const [modalIdiomasVisible, setModalIdiomasVisible] = useState(false);
  const [modalInstitucionesVisible, setModalInstitucionesVisible] = useState(false);
  const [modalModalidadesVisible, setModalModalidadesVisible] = useState(false);
  const [modalDeptosVisible, setModalDeptosVisible] = useState(false);
  const [modalMunicipiosVisible, setModalMunicipiosVisible] = useState(false);

  // Estado para errores
  const [errores, setErrores] = useState<string[]>([]);

  // Cargar datos del usuario logeado
  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      } else {
        router.replace("/(auth)/LoginScreen");
      }
    };
    loadUser();
  }, []);

  // Estado para nueva institución
  const [crearNuevaInstitucion, setCrearNuevaInstitucion] = useState(false);
  const [nuevaInstitucion, setNuevaInstitucion] = useState({
    nombre: "",
    idDepartamento: 0,
    idMunicipio: 0,
    nombreContacto: "",
    telefonoContacto: "",
    emailContacto: "",
  });

  // Cargar datos desde API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [
          carrerasRes,
          idiomasRes,
          nivelesRes,
          habilidadesRes,
          departamentosRes,
          institucionesRes,
          modalidadesRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/carreras`),
          axios.get(`${API_URL}/idiomas`),
          axios.get(`${API_URL}/niveles`),
          axios.get(`${API_URL}/habilidades`),
          axios.get(`${API_URL}/departamentos`),
          axios.get(`${API_URL}/proyectos/instituciones`),
          axios.get(`${API_URL}/modalidades`),
        ]);

        setCarreras(carrerasRes.data);
        setIdiomas(idiomasRes.data);
        setNiveles(nivelesRes.data);
        setHabilidades(habilidadesRes.data);
        setDepartamentos(departamentosRes.data);
        setInstituciones(institucionesRes.data);
        setModalidades(modalidadesRes.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
        showToast("❌ Error cargando datos iniciales");
      }
    };
    cargarDatos();
  }, []);

  // Cargar municipios cuando se selecciona departamento para nueva institución
  useEffect(() => {
    if (crearNuevaInstitucion && nuevaInstitucion.idDepartamento) {
      axios
        .get(`${API_URL}/municipios/${nuevaInstitucion.idDepartamento}`)
        .then((res) => setMunicipios(res.data))
        .catch(console.error);
    } else {
      setMunicipios([]);
    }
  }, [nuevaInstitucion.idDepartamento, crearNuevaInstitucion]);

  // Cuando se selecciona una institución existente, bloquear el checkbox
  useEffect(() => {
    if (institucion !== "" && instituciones.length > 0) {
      const institucionSeleccionada = instituciones.find(
        (i) => i.idInstitucion === Number(institucion),
      );
      if (institucionSeleccionada) {
        setNuevaInstitucion({
          nombre: institucionSeleccionada.nombre,
          idDepartamento: institucionSeleccionada.idDepartamento,
          idMunicipio: institucionSeleccionada.idMunicipio,
          nombreContacto: institucionSeleccionada.nombreContacto || "",
          telefonoContacto: institucionSeleccionada.telefonoContacto || "",
          emailContacto: institucionSeleccionada.emailContacto || "",
        });
      }
    }
  }, [institucion, instituciones]);

  // Filtrar habilidades mientras se escribe
  useEffect(() => {
    setSugerenciasTecnicas(
      habilidades.filter(
        (h) =>
          h.tipo === "Técnica" &&
          h.nombre
            .toLowerCase()
            .includes(inputHabilidadTecnica.toLowerCase()) &&
          !habilidadesTecnicas.some((ht) => ht.idHabilidad === h.idHabilidad),
      ),
    );
  }, [inputHabilidadTecnica, habilidadesTecnicas, habilidades]);

  useEffect(() => {
    setSugerenciasBlandas(
      habilidades.filter(
        (h) =>
          h.tipo === "Blanda" &&
          h.nombre.toLowerCase().includes(inputHabilidadBlanda.toLowerCase()) &&
          !habilidadesBlandas.some((hb) => hb.idHabilidad === h.idHabilidad),
      ),
    );
  }, [inputHabilidadBlanda, habilidadesBlandas, habilidades]);

  // Funciones para habilidades
  const agregarHabilidad = (h: Habilidad, tipo: "Técnica" | "Blanda") => {
    if (tipo === "Técnica") {
      setHabilidadesTecnicas([...habilidadesTecnicas, h]);
      setInputHabilidadTecnica("");
    } else {
      setHabilidadesBlandas([...habilidadesBlandas, h]);
      setInputHabilidadBlanda("");
    }
  };

  const crearYAgregarHabilidad = async (tipo: "Técnica" | "Blanda") => {
    const nombreHabilidad =
      tipo === "Técnica" ? inputHabilidadTecnica : inputHabilidadBlanda;

    if (!nombreHabilidad.trim()) return;

    try {
      setCreandoHabilidad(tipo);

      const response = await axios.post(`${API_URL}/habilidades`, {
        nombre: nombreHabilidad,
        tipo: tipo,
      });

      const nuevaHabilidad = response.data;
      setHabilidades((prev) => [...prev, nuevaHabilidad]);
      agregarHabilidad(nuevaHabilidad, tipo);

      showToast(`✅ Habilidad "${nombreHabilidad}" creada y agregada`, true);
    } catch (error) {
      console.error("Error creando habilidad:", error);
      showToast("❌ Error al crear la habilidad");
    } finally {
      setCreandoHabilidad(null);
    }
  };

  const eliminarHabilidad = (id: number, tipo: "Técnica" | "Blanda") => {
    if (tipo === "Técnica")
      setHabilidadesTecnicas(
        habilidadesTecnicas.filter((h) => h.idHabilidad !== id),
      );
    else
      setHabilidadesBlandas(
        habilidadesBlandas.filter((h) => h.idHabilidad !== id),
      );
  };

  // Funciones para especialidades
  const toggleEspecialidad = (idCarrera: number) => {
    setEspecialidades((prev) =>
      prev.includes(idCarrera)
        ? prev.filter((id) => id !== idCarrera)
        : [...prev, idCarrera],
    );
  };

  const getEspecialidadesTexto = () => {
    if (especialidades.length === 0) return "Carreras requeridas (opcional)";
    if (especialidades.length === 1) {
      const carrera = carreras.find((c) => c.idCarrera === especialidades[0]);
      return carrera ? carrera.nombre : "1 especialidad seleccionada";
    }
    return `${especialidades.length} especialidades seleccionadas`;
  };

  // Funciones para idiomas y niveles
  const toggleIdiomaNivel = (idIdioma: number, idINivel: number) => {
    const existeIndex = idiomasSeleccionados.findIndex(
      (item) => item.idIdioma === idIdioma,
    );

    if (existeIndex !== -1) {
      const nuevosIdiomas = [...idiomasSeleccionados];
      nuevosIdiomas.splice(existeIndex, 1);
      setIdiomasSeleccionados(nuevosIdiomas);
    } else {
      setIdiomasSeleccionados([
        ...idiomasSeleccionados,
        { idIdioma, idINivel },
      ]);
    }
  };

  const actualizarNivelIdioma = (idIdioma: number, idINivel: number) => {
    const nuevosIdiomas = idiomasSeleccionados.map((item) =>
      item.idIdioma === idIdioma ? { ...item, idINivel } : item,
    );
    setIdiomasSeleccionados(nuevosIdiomas);
  };

  const getIdiomasTexto = () => {
    if (idiomasSeleccionados.length === 0)
      return "Idiomas y niveles (opcional)";
    return `${idiomasSeleccionados.length} idioma(s) seleccionado(s)`;
  };

  // Toggle para crear nueva institución
  const toggleCrearInstitucion = () => {
    if (institucion !== "") {
      showToast("❌ Primero deselecciona la institución actual");
      return;
    }

    setCrearNuevaInstitucion(!crearNuevaInstitucion);

    if (!crearNuevaInstitucion) {
      setNuevaInstitucion({
        nombre: "",
        idDepartamento: 0,
        idMunicipio: 0,
        nombreContacto: "",
        telefonoContacto: "",
        emailContacto: "",
      });
    }
  };

  const handleInstitucionChange = (value: string | number) => {
    setInstitucion(value);
    if (value !== "") {
      setCrearNuevaInstitucion(false);
    }
    setModalInstitucionesVisible(false);
  };

  // Validaciones
  const validarTelefono = (text: string) => {
    if (/^\d{0,4}-?\d{0,4}$/.test(text)) {
      if (text.length === 4 && !text.includes("-")) {
        setNuevaInstitucion({
          ...nuevaInstitucion,
          telefonoContacto: text + "-",
        });
      } else {
        setNuevaInstitucion({ ...nuevaInstitucion, telefonoContacto: text });
      }
    }
  };

  const validarFechas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio && fechaInicio < hoy) {
      showToast("❌ La fecha de inicio no puede ser anterior a hoy");
      setFechaInicio(null);
      return false;
    }

    if (fechaInicio && fechaFin && fechaFin <= fechaInicio) {
      showToast("❌ La fecha de fin debe ser posterior a la fecha de inicio");
      setFechaFin(null);
      return false;
    }

    if (fechaAplicacion && fechaAplicacion < hoy) {
      showToast("❌ La fecha de aplicación no puede ser anterior a hoy");
      setFechaAplicacion(null);
      return false;
    }

    if (fechaAplicacion && fechaInicio && fechaAplicacion > fechaInicio) {
      showToast(
        "❌ La fecha de aplicación debe ser anterior al inicio del proyecto",
      );
      setFechaAplicacion(null);
      return false;
    }

    return true;
  };

  const validarFormulario = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const nuevosErrores: string[] = [];

    if (!nombreProyecto) nuevosErrores.push("Nombre del proyecto");

    if (crearNuevaInstitucion) {
      if (!nuevaInstitucion.nombre) nuevosErrores.push("Nombre de institución");
      if (!nuevaInstitucion.idDepartamento) nuevosErrores.push("Departamento");
      if (!nuevaInstitucion.idMunicipio) nuevosErrores.push("Municipio");
      if (!nuevaInstitucion.nombreContacto) nuevosErrores.push("Nombre de contacto");
      if (!nuevaInstitucion.telefonoContacto) nuevosErrores.push("Teléfono");
      if (!nuevaInstitucion.emailContacto) nuevosErrores.push("Email");
    } else {
      if (!institucion) nuevosErrores.push("Institución");
    }

    if (!fechaAplicacion) nuevosErrores.push("Fecha de aplicación");
    else if (fechaAplicacion < hoy) nuevosErrores.push("Fecha aplicación no puede ser anterior a hoy");

    if (!fechaInicio) nuevosErrores.push("Fecha de inicio");
    else if (fechaInicio < hoy) nuevosErrores.push("Fecha de inicio no puede ser anterior a hoy");
    else if (fechaAplicacion && fechaInicio < fechaAplicacion) nuevosErrores.push("Fecha inicio debe ser posterior a fecha aplicación");

    if (!fechaFin) nuevosErrores.push("Fecha de fin");
    else if (fechaFin <= fechaInicio!) nuevosErrores.push("Fecha fin debe ser posterior a inicio");

    if (!descripcion) nuevosErrores.push("Descripción");
    if (!capacidad) nuevosErrores.push("Capacidad");
    if (!horas) nuevosErrores.push("Horas");
    if (habilidadesTecnicas.length === 0) nuevosErrores.push("Habilidades técnicas");
    if (habilidadesBlandas.length === 0) nuevosErrores.push("Habilidades blandas");
    if (!modalidad) nuevosErrores.push("Modalidad");

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

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
      textStyle: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
      },
    });
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      showToast(`⚠️ Completa los campos requeridos`);
      return;
    }

    if (!userData?.carnet) {
      showToast("⚠️ No se identificó al usuario. Inicia sesión nuevamente.");
      return;
    }

    try {
      const proyectoData = {
        titulo: nombreProyecto,
        descripcion,
        capacidad: parseInt(capacidad),
        horas: parseInt(horas),
        carrerasRelacionadas: especialidades,
        habilidadesRelacionadas: [
          ...habilidadesTecnicas.map((h) => ({
            idHabilidad: h.idHabilidad,
            esRequerida: true,
          })),
          ...habilidadesBlandas.map((h) => ({
            idHabilidad: h.idHabilidad,
            esRequerida: true,
          })),
        ],
        idiomasRelacionados: idiomasSeleccionados,
        idInstitucion: crearNuevaInstitucion ? null : institucion ? Number(institucion) : null,
        fechaInicio: fechaInicio?.toISOString().split("T")[0],
        fechaFin: fechaFin?.toISOString().split("T")[0],
        fechaAplicacion: fechaAplicacion?.toISOString().split("T")[0],
        idModalidad: modalidad ? Number(modalidad) : null,
        idDepartamento: nuevaInstitucion.idDepartamento,
        idMunicipio: nuevaInstitucion.idMunicipio,
        carnetUsuario: userData.carnet,
      };

      if (crearNuevaInstitucion) {
        Object.assign(proyectoData, {
          nombreInstitucion: nuevaInstitucion.nombre,
          nombreContacto: nuevaInstitucion.nombreContacto,
          telefonoContacto: nuevaInstitucion.telefonoContacto,
          emailContacto: nuevaInstitucion.emailContacto,
        });
      }

      const response = await axios.post(`${API_URL}/proyectos`, proyectoData);

      if (response.status === 201) {

        showToast("✅ Solicitud mandada. Te notificaremos si es aprobado", true);
        setTimeout(() => router.back(), 1500);
      }

    } catch (error) {
      console.error("Error creando proyecto:", error);
      showToast("❌ Error al crear el proyecto");
    }
  };

  // Helpers de texto para renderizar los valores actuales en los nuevos modales
  const getInstitucionTexto = () => {
    if (institucion === "") return "Selecciona la institución";
    const inst = instituciones.find((i) => i.idInstitucion === Number(institucion));
    return inst ? inst.nombre : "Selecciona la institución";
  };

  const getModalidadTexto = () => {
    if (modalidad === "") return "Selecciona la modalidad";
    const mod = modalidades.find((m) => m.idModalidad === Number(modalidad));
    return mod ? mod.nombre : "Selecciona la modalidad";
  };

  const getDepartamentoTexto = () => {
    if (nuevaInstitucion.idDepartamento === 0) return "Departamento";
    const dep = departamentos.find((d) => d.idDepartamento === nuevaInstitucion.idDepartamento);
    return dep ? dep.nombre : "Departamento";
  };

  const getMunicipioTexto = () => {
    if (nuevaInstitucion.idMunicipio === 0) return "Municipio";
    const mun = municipios.find((m) => m.idMunicipio === nuevaInstitucion.idMunicipio);
    return mun ? mun.nombre : "Municipio";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agregar Proyecto</Text>
        <Ionicons
          name="arrow-back"
          size={28}
          color="#000"
          onPress={() => router.back()}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.contentBackground}
          contentContainerStyle={{ paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nombre del proyecto */}
          <View style={[styles.inputContainer, { marginTop: 30 }]}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del proyecto"
              placeholderTextColor="#666"
              value={nombreProyecto}
              onChangeText={setNombreProyecto}
            />
          </View>

          {/* Especialidad */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setModalEspecialidadesVisible(true)}
          >
            <Text
              style={[
                styles.input,
                { color: especialidades.length > 0 ? "#000" : "#666" },
              ]}
            >
              {getEspecialidadesTexto()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#213A8E" />
          </TouchableOpacity>

          {/* NUEVA INSTITUCIÓN: Selector estilizado que abre Modal */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              crearNuevaInstitucion && styles.disabledInput,
            ]}
            onPress={() => !crearNuevaInstitucion && setModalInstitucionesVisible(true)}
            disabled={crearNuevaInstitucion}
          >
            <Text
              style={[
                styles.input,
                { color: institucion !== "" ? "#000" : "#666" },
              ]}
            >
              {getInstitucionTexto()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#213A8E" />
          </TouchableOpacity>

          {/* Checkbox para crear nueva institución */}
          <View style={styles.checkboxRow}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={toggleCrearInstitucion}
                disabled={!!institucion && institucion !== ""}
              >
                <Ionicons
                  name={crearNuevaInstitucion ? "checkbox" : "square-outline"}
                  size={22}
                  color={crearNuevaInstitucion ? "#2666DE" : institucion ? "#ccc" : "#666"}
                />
                <Text
                  style={[
                    styles.checkboxText,
                    institucion ? styles.disabledText : null,
                  ]}
                >
                  Crear nueva institución
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campos para nueva institución */}
          {crearNuevaInstitucion && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de la nueva institución"
                  placeholderTextColor="#666"
                  value={nuevaInstitucion.nombre}
                  onChangeText={(text) =>
                    setNuevaInstitucion({ ...nuevaInstitucion, nombre: text })
                  }
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer2, styles.half]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Contacto"
                    placeholderTextColor="#666"
                    value={nuevaInstitucion.nombreContacto}
                    onChangeText={(text) =>
                      setNuevaInstitucion({
                        ...nuevaInstitucion,
                        nombreContacto: text,
                      })
                    }
                  />
                </View>
                <View style={[styles.inputContainer2, styles.half]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Teléfono"
                    placeholderTextColor="#666"
                    value={nuevaInstitucion.telefonoContacto}
                    onChangeText={validarTelefono}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Correo de contacto"
                  placeholderTextColor="#666"
                  value={nuevaInstitucion.emailContacto}
                  onChangeText={(text) =>
                    setNuevaInstitucion({
                      ...nuevaInstitucion,
                      emailContacto: text,
                    })
                  }
                  keyboardType="email-address"
                />
              </View>

              {/* Selector departamento estilizado */}
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalDeptosVisible(true)}
              >
                <Text style={[styles.input, { color: nuevaInstitucion.idDepartamento !== 0 ? "#000" : "#666" }]}>
                  {getDepartamentoTexto()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#213A8E" />
              </TouchableOpacity>

              {/* Selector municipio estilizado */}
              <TouchableOpacity
                style={[styles.inputContainer, !nuevaInstitucion.idDepartamento && styles.disabledInput]}
                onPress={() => nuevaInstitucion.idDepartamento !== 0 && setModalMunicipiosVisible(true)}
                disabled={nuevaInstitucion.idDepartamento === 0}
              >
                <Text style={[styles.input, { color: nuevaInstitucion.idMunicipio !== 0 ? "#000" : "#666" }]}>
                  {nuevaInstitucion.idDepartamento !== 0 ? getMunicipioTexto() : "Primero selecciona departamento"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#213A8E" />
              </TouchableOpacity>
            </>
          )}

          {/* FECHA DE APLICACIÓN */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowAplicacion(true)}
          >
            <Text style={[styles.input, { color: fechaAplicacion ? "#000" : "#666" }]}>
              {fechaAplicacion ? fechaAplicacion.toLocaleDateString() : "Fecha límite para aplicar"}
            </Text>
            <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
          </TouchableOpacity>
          {showAplicacion && (
            <DateTimePicker
              value={fechaAplicacion || new Date()}
              mode="date"
              display="calendar"
              onChange={(event, selectedDate) => {
                setShowAplicacion(false);
                if (selectedDate) setFechaAplicacion(selectedDate);
              }}
            />
          )}

          {/* FECHAS DE INICIO Y FIN */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.inputContainer2, styles.half, { opacity: fechaAplicacion ? 1 : 0.5 }]}
              onPress={() => fechaAplicacion && setShowInicio(true)}
              disabled={!fechaAplicacion}
            >
              <Text style={[styles.input, { color: fechaInicio ? "#000" : "#666" }]}>
                {fechaInicio ? fechaInicio.toLocaleDateString() : "Inicio"}
              </Text>
              <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
            </TouchableOpacity>
            {showInicio && (
              <DateTimePicker
                value={fechaInicio || new Date()}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowInicio(false);
                  if (selectedDate) {
                    setFechaInicio(selectedDate);
                    validarFechas();
                  }
                }}
              />
            )}
            <TouchableOpacity
              style={[styles.inputContainer2, styles.half, { opacity: fechaInicio ? 1 : 0.5 }]}
              onPress={() => fechaInicio && setShowFin(true)}
              disabled={!fechaInicio}
            >
              <Text style={[styles.input, { color: fechaFin ? "#000" : "#666" }]}>
                {fechaFin ? fechaFin.toLocaleDateString() : "Fin"}
              </Text>
              <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
            </TouchableOpacity>
            {showFin && (
              <DateTimePicker
                value={fechaFin || new Date()}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowFin(false);
                  if (selectedDate) {
                    setFechaFin(selectedDate);
                    setTimeout(validarFechas, 100);
                  }
                }}
              />
            )}
          </View>

          {/* Descripción */}
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción del proyecto"
              placeholderTextColor="#666"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Capacidad y Horas */}
          <View style={styles.row}>
            <View style={[styles.inputContainer2, styles.half]}>
              <TextInput
                style={styles.input}
                placeholder="Capacidad"
                placeholderTextColor="#666"
                value={capacidad}
                onChangeText={setCapacidad}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer2, styles.half]}>
              <TextInput
                style={styles.input}
                placeholder="Horas"
                placeholderTextColor="#666"
                value={horas}
                onChangeText={setHoras}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Idiomas y Niveles */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setModalIdiomasVisible(true)}
          >
            <Text style={[styles.input, { color: idiomasSeleccionados.length > 0 ? "#000" : "#666" }]}>
              {getIdiomasTexto()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#213A8E" />
          </TouchableOpacity>

          {/* NUEVA MODALIDAD: Selector que abre modal estilizado */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setModalModalidadesVisible(true)}
          >
            <Text style={[styles.input, { color: modalidad !== "" ? "#000" : "#666" }]}>
              {getModalidadTexto()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#213A8E" />
          </TouchableOpacity>

          {/* Habilidades técnicas */}
          <View style={{ zIndex: 1000 }}>
            <View style={styles.chipsInputContainer}>
              <View style={styles.chipsContainer}>
                {habilidadesTecnicas.map((h) => (
                  <View key={h.idHabilidad} style={styles.chip}>
                    <Text style={styles.chipText}>{h.nombre}</Text>
                    <TouchableOpacity onPress={() => eliminarHabilidad(h.idHabilidad, "Técnica")} style={styles.chipClose}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TextInput
                  style={styles.chipTextInput}
                  placeholder="Habilidades técnicas requeridas"
                  placeholderTextColor="#666"
                  value={inputHabilidadTecnica}
                  onChangeText={setInputHabilidadTecnica}
                />
              </View>
            </View>

            {inputHabilidadTecnica.length > 0 && sugerenciasTecnicas.length > 0 && (
              <View style={styles.inlineSuggestionsList}>
                <ScrollView style={styles.suggestionsScroll} nestedScrollEnabled={true}>
                  {sugerenciasTecnicas.map((item) => (
                    <TouchableOpacity key={item.idHabilidad} onPress={() => agregarHabilidad(item, "Técnica")} style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>{item.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {inputHabilidadTecnica.length > 0 && sugerenciasTecnicas.length === 0 && (
              <View style={styles.inlineSuggestionsList}>
                <TouchableOpacity
                  onPress={() => crearYAgregarHabilidad("Técnica")}
                  style={styles.suggestionItem}
                  disabled={creandoHabilidad === "Técnica"}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#2666DE" />
                  <Text style={[styles.suggestionText, { marginLeft: 8 }]}>
                    {creandoHabilidad === "Técnica" ? "Creando..." : `Crear "${inputHabilidadTecnica}"`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Habilidades blandas */}
          <View style={{ zIndex: 900 }}>
            <View style={styles.chipsInputContainer}>
              <View style={styles.chipsContainer}>
                {habilidadesBlandas.map((h) => (
                  <View key={h.idHabilidad} style={styles.chip}>
                    <Text style={styles.chipText}>{h.nombre}</Text>
                    <TouchableOpacity onPress={() => eliminarHabilidad(h.idHabilidad, "Blanda")} style={styles.chipClose}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TextInput
                  style={styles.chipTextInput}
                  placeholder="Habilidades blandas requeridas"
                  placeholderTextColor="#666"
                  value={inputHabilidadBlanda}
                  onChangeText={setInputHabilidadBlanda}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
              </View>
            </View>

            {inputHabilidadBlanda.length > 0 && sugerenciasBlandas.length > 0 && (
              <View style={styles.inlineSuggestionsList}>
                <ScrollView style={styles.suggestionsScroll} nestedScrollEnabled={true}>
                  {sugerenciasBlandas.map((item) => (
                    <TouchableOpacity key={item.idHabilidad} onPress={() => agregarHabilidad(item, "Blanda")} style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>{item.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {inputHabilidadBlanda.length > 0 && sugerenciasBlandas.length === 0 && (
              <View style={styles.inlineSuggestionsList}>
                <TouchableOpacity onPress={() => crearYAgregarHabilidad("Blanda")} style={styles.suggestionItem} disabled={creandoHabilidad === "Blanda"}>
                  <Ionicons name="add-circle-outline" size={20} color="#2666DE" />
                  <Text style={[styles.suggestionText, { marginLeft: 8 }]}>
                    {creandoHabilidad === "Blanda" ? "Creando..." : `Crear "${inputHabilidadBlanda}"`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Botón guardar */}
          <View style={{ alignItems: "flex-end", marginTop: 20 }}>
            <TouchableOpacity style={styles.buttonYellow} onPress={handleSubmit}>
              <Ionicons name="save-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={28} color="#fff" onPress={() => router.push("/")} />
        <Ionicons name="star-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/guardados")} />
        <Ionicons name="file-tray-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/aplicaciones")} />
        <Ionicons name="notifications-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/notificaciones")} />
        <Ionicons name="person-outline" size={28} color="#fff" onPress={() => router.push("/(tabs)/cuenta")} />
      </View>

      {/* --- MODALES INTACTOS ORIGINALES --- */}
      <Modal visible={modalEspecialidadesVisible} animationType="slide" transparent={true} onRequestClose={() => setModalEspecialidadesVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Carreras requeridas (opcional)</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalEspecialidadesVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {carreras.map((carrera) => (
                <TouchableOpacity
                  key={carrera.idCarrera}
                  style={[styles.especialidadOption, especialidades.includes(carrera.idCarrera) && styles.especialidadSelected]}
                  onPress={() => toggleEspecialidad(carrera.idCarrera)}
                >
                  <Ionicons
                    name={especialidades.includes(carrera.idCarrera) ? "checkbox" : "square-outline"}
                    size={22}
                    color={especialidades.includes(carrera.idCarrera) ? "#2666DE" : "#666"}
                  />
                  <Text style={styles.especialidadText}>{carrera.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.aplicarButton} onPress={() => setModalEspecialidadesVisible(false)}>
                <Text style={styles.aplicarButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalIdiomasVisible} animationType="slide" transparent={true} onRequestClose={() => setModalIdiomasVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Idiomas y niveles (opcional)</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalIdiomasVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {idiomas.map((idiomaItem) => {
                const estaSeleccionado = idiomasSeleccionados.some((item) => item.idIdioma === idiomaItem.idIdioma);
                const nivelSeleccionado = idiomasSeleccionados.find((item) => item.idIdioma === idiomaItem.idIdioma)?.idINivel;
                return (
                  <View key={idiomaItem.idIdioma} style={styles.idiomaContainer}>
                    <TouchableOpacity
                      style={[styles.idiomaOption, estaSeleccionado && styles.idiomaSelected]}
                      onPress={() => niveles.length > 0 ? toggleIdiomaNivel(idiomaItem.idIdioma, niveles[0].idINivel) : showToast("⚠️ No hay niveles")}
                    >
                      <Ionicons name={estaSeleccionado ? "checkbox" : "square-outline"} size={22} color={estaSeleccionado ? "#2666DE" : "#666"} />
                      <Text style={styles.idiomaText}>{idiomaItem.nombre}</Text>
                    </TouchableOpacity>
                    {estaSeleccionado && (
                      <View style={styles.nivelesContainer}>
                        <Text style={styles.nivelesTitle}>Nivel requerido:</Text>
                        <View style={styles.nivelesOptions}>
                          {niveles.map((nivelItem) => (
                            <TouchableOpacity
                              key={nivelItem.idINivel}
                              style={[styles.nivelOption, nivelSeleccionado === nivelItem.idINivel && styles.nivelSelected]}
                              onPress={() => actualizarNivelIdioma(idiomaItem.idIdioma, nivelItem.idINivel)}
                            >
                              <Text style={[styles.nivelText, nivelSeleccionado === nivelItem.idINivel && styles.nivelTextSelected]}>
                                {nivelItem.nombre}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.aplicarButton} onPress={() => setModalIdiomasVisible(false)}>
                <Text style={styles.aplicarButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* NUEVOS MODALES ESTILIZADOS: REEMPLAZAN COMPLETAMENTE A LOS PICKERS NATIVOS */}
      {/* ========================================================================= */}

      {/* 1. Modal personalizado para Instituciones */}
      <Modal visible={modalInstitucionesVisible} animationType="slide" transparent={true} onRequestClose={() => setModalInstitucionesVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona la institución</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalInstitucionesVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity style={[styles.especialidadOption, institucion === "" && styles.especialidadSelected]} onPress={() => handleInstitucionChange("")}>
                <Ionicons name={institucion === "" ? "radio-button-on" : "radio-button-off"} size={22} color={institucion === "" ? "#2666DE" : "#666"} />
                <Text style={styles.especialidadText}>Ninguna / Selecciona la institución</Text>
              </TouchableOpacity>
              {instituciones.map((inst) => (
                <TouchableOpacity
                  key={inst.idInstitucion}
                  style={[styles.especialidadOption, Number(institucion) === inst.idInstitucion && styles.especialidadSelected]}
                  onPress={() => handleInstitucionChange(inst.idInstitucion)}
                >
                  <Ionicons name={Number(institucion) === inst.idInstitucion ? "radio-button-on" : "radio-button-off"} size={22} color={Number(institucion) === inst.idInstitucion ? "#2666DE" : "#666"} />
                  <Text style={styles.especialidadText}>{inst.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Modal personalizado para Modalidades */}
      <Modal visible={modalModalidadesVisible} animationType="slide" transparent={true} onRequestClose={() => setModalModalidadesVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona la modalidad</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalModalidadesVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity style={[styles.especialidadOption, modalidad === "" && styles.especialidadSelected]} onPress={() => { setModalidad(""); setModalModalidadesVisible(false); }}>
                <Ionicons name={modalidad === "" ? "radio-button-on" : "radio-button-off"} size={22} color={modalidad === "" ? "#2666DE" : "#666"} />
                <Text style={styles.especialidadText}>Selecciona la modalidad</Text>
              </TouchableOpacity>
              {modalidades.map((mod) => (
                <TouchableOpacity
                  key={mod.idModalidad}
                  style={[styles.especialidadOption, Number(modalidad) === mod.idModalidad && styles.especialidadSelected]}
                  onPress={() => { setModalidad(mod.idModalidad); setModalModalidadesVisible(false); }}
                >
                  <Ionicons name={Number(modalidad) === mod.idModalidad ? "radio-button-on" : "radio-button-off"} size={22} color={Number(modalidad) === mod.idModalidad ? "#2666DE" : "#666"} />
                  <Text style={styles.especialidadText}>{mod.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. Modal personalizado para Departamentos */}
      <Modal visible={modalDeptosVisible} animationType="slide" transparent={true} onRequestClose={() => setModalDeptosVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona el Departamento</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalDeptosVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity style={[styles.especialidadOption, nuevaInstitucion.idDepartamento === 0 && styles.especialidadSelected]} onPress={() => { setNuevaInstitucion({ ...nuevaInstitucion, idDepartamento: 0, idMunicipio: 0 }); setModalDeptosVisible(false); }}>
                <Ionicons name={nuevaInstitucion.idDepartamento === 0 ? "radio-button-on" : "radio-button-off"} size={22} color={nuevaInstitucion.idDepartamento === 0 ? "#2666DE" : "#666"} />
                <Text style={styles.especialidadText}>Departamento</Text>
              </TouchableOpacity>
              {departamentos.map((d) => (
                <TouchableOpacity
                  key={d.idDepartamento}
                  style={[styles.especialidadOption, nuevaInstitucion.idDepartamento === d.idDepartamento && styles.especialidadSelected]}
                  onPress={() => { setNuevaInstitucion({ ...nuevaInstitucion, idDepartamento: d.idDepartamento, idMunicipio: 0 }); setModalDeptosVisible(false); }}
                >
                  <Ionicons name={nuevaInstitucion.idDepartamento === d.idDepartamento ? "radio-button-on" : "radio-button-off"} size={22} color={nuevaInstitucion.idDepartamento === d.idDepartamento ? "#2666DE" : "#666"} />
                  <Text style={styles.especialidadText}>{d.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Modal personalizado para Municipios */}
      <Modal visible={modalMunicipiosVisible} animationType="slide" transparent={true} onRequestClose={() => setModalMunicipiosVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona el Municipio</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalMunicipiosVisible(false)}>
                <Ionicons name="close" size={24} color="#213A8E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <TouchableOpacity style={[styles.especialidadOption, nuevaInstitucion.idMunicipio === 0 && styles.especialidadSelected]} onPress={() => { setNuevaInstitucion({ ...nuevaInstitucion, idMunicipio: 0 }); setModalMunicipiosVisible(false); }}>
                <Ionicons name={nuevaInstitucion.idMunicipio === 0 ? "radio-button-on" : "radio-button-off"} size={22} color={nuevaInstitucion.idMunicipio === 0 ? "#2666DE" : "#666"} />
                <Text style={styles.especialidadText}>Municipio</Text>
              </TouchableOpacity>
              {municipios.map((m) => (
                <TouchableOpacity
                  key={m.idMunicipio}
                  style={[styles.especialidadOption, nuevaInstitucion.idMunicipio === m.idMunicipio && styles.especialidadSelected]}
                  onPress={() => { setNuevaInstitucion({ ...nuevaInstitucion, idMunicipio: m.idMunicipio }); setModalMunicipiosVisible(false); }}
                >
                  <Ionicons name={nuevaInstitucion.idMunicipio === m.idMunicipio ? "radio-button-on" : "radio-button-off"} size={22} color={nuevaInstitucion.idMunicipio === m.idMunicipio ? "#2666DE" : "#666"} />
                  <Text style={styles.especialidadText}>{m.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 91,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "MyriadPro-Bold",
  },
  contentBackground: {
    flex: 1,
    backgroundColor: "#F2F6FC",
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  half: { flex: 1 },
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
  inputContainer2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderLeftWidth: 15,
    borderLeftColor: "#2666DE",
    height: 55,
    shadowColor: "#2666DE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#000",
    height: 55,
    textAlignVertical: "center",
  },
  textAreaContainer: {
    height: 120,
    alignItems: "flex-start",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 15,
    paddingBottom: 15,
    includeFontPadding: true,
  },
  iconCalendar: { marginRight: 10 },
  buttonYellow: {
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#2666DE",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 30,
    paddingTop: 20,
    borderWidth: 0,
    elevation: 0,
  },
  chipsInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 15,
    borderLeftColor: "#2666DE",
    paddingVertical: 10,
    minHeight: 55,
    paddingHorizontal: 5,
    justifyContent: "center",
    shadowColor: "#2666DE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2666DE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    margin: 5,
  },
  chipText: {
    color: "#fff",
    fontFamily: "Inter-Medium",
    fontSize: 12,
  },
  chipClose: {
    marginLeft: 5,
  },
  chipTextInput: {
    flexGrow: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#000",
    minWidth: 100,
    includeFontPadding: false,
    textAlignVertical: "center",
    paddingVertical: 0,
    marginVertical: 0,
  },
  inlineSuggestionsList: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2666DE",
    borderRadius: 12,
    marginTop: -10,
    marginBottom: 15,
    maxHeight: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: "hidden",
  },
  suggestionsScroll: {
    maxHeight: 180,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#333",
  },
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
  modalButtons: {
    paddingHorizontal: 20,
    marginTop: 10,
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
  idiomaContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  idiomaOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  idiomaSelected: {
    backgroundColor: "#F2F6FC",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  idiomaText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "#333",
    flex: 1,
  },
  nivelesContainer: {
    marginLeft: 32,
    marginTop: 5,
  },
  nivelesTitle: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#666",
    marginBottom: 5,
  },
  nivelesOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nivelOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  nivelSelected: {
    backgroundColor: "#2666DE",
    borderColor: "#2666DE",
  },
  nivelText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#666",
  },
  nivelTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  aplicarButton: {
    backgroundColor: "#2666DE",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  aplicarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "MyriadPro-Bold",
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  checkboxContainer: {
    alignItems: "flex-end",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#333",
  },
  disabledText: {
    color: "#ccc",
  },
  disabledInput: {
    opacity: 0.6,
  },
});